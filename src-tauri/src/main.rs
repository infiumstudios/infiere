// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures_util::StreamExt;
use reqwest::Client;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{Emitter, Manager, State};
use uuid::Uuid;

// ---------- Shared state ----------

pub struct Db(pub Mutex<Connection>);

// ---------- Types ----------

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub role: String, // "user" | "assistant" | "system"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub chat_id: String,
    pub message: String,
    pub model: String,
    pub history: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatSummary {
    pub id: String,
    pub title: String,
    pub model: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StoredMessage {
    pub id: String,
    pub chat_id: String,
    pub role: String,
    pub content: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProviderInfo {
    pub name: String,
    pub connected: bool,
}

// ---------- DB setup ----------

fn init_db(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS chats (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            model       TEXT NOT NULL,
            created_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
            id          TEXT PRIMARY KEY,
            chat_id     TEXT NOT NULL,
            role        TEXT NOT NULL,
            content     TEXT NOT NULL,
            created_at  TEXT NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS providers (
            name        TEXT PRIMARY KEY,
            api_key     TEXT NOT NULL,
            connected   INTEGER NOT NULL DEFAULT 1
        );
        ",
    )
}

fn now() -> String {
    chrono::Utc::now().to_rfc3339()
}

// Cheap, dependency-free title generator: first few words of the prompt,
// trimmed and capitalized. Swap this out for a model-generated title later
// if you want something smarter (e.g. a short Ollama call with a "summarize
// this into a 5 word title" system prompt).
fn generate_title(first_message: &str) -> String {
    let words: Vec<&str> = first_message.split_whitespace().take(6).collect();
    let mut title = words.join(" ");
    if first_message.split_whitespace().count() > 6 {
        title.push('…');
    }
    if title.trim().is_empty() {
        "New chat".to_string()
    } else {
        title
    }
}

// ---------- Commands: chats ----------

#[tauri::command]
fn create_chat(db: State<Db>, first_message: String, model: String) -> Result<ChatSummary, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let title = generate_title(&first_message);
    let created_at = now();

    conn.execute(
        "INSERT INTO chats (id, title, model, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, title, model, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(ChatSummary { id, title, model, created_at })
}

#[tauri::command]
fn list_chats(db: State<Db>) -> Result<Vec<ChatSummary>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, model, created_at FROM chats ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ChatSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                model: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_chat(db: State<Db>, chat_id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM messages WHERE chat_id = ?1", params![chat_id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM chats WHERE id = ?1", params![chat_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_messages(db: State<Db>, chat_id: String) -> Result<Vec<StoredMessage>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, chat_id, role, content, created_at FROM messages
             WHERE chat_id = ?1 ORDER BY created_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![chat_id], |row| {
            Ok(StoredMessage {
                id: row.get(0)?,
                chat_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

fn save_message_internal(conn: &Connection, chat_id: &str, role: &str, content: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![Uuid::new_v4().to_string(), chat_id, role, content, now()],
    )?;
    Ok(())
}

#[tauri::command]
fn save_message(db: State<Db>, chat_id: String, role: String, content: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    save_message_internal(&conn, &chat_id, &role, &content).map_err(|e| e.to_string())
}

// ---------- Commands: models (Ollama) ----------

#[tauri::command]
async fn list_models() -> Result<Vec<String>, String> {
    let client = Client::new();
    let response = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| format!("Couldn't reach Ollama — is it running? ({e})"))?;

    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let models = data["models"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter_map(|m| m["name"].as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}

// ---------- Commands: chat send (Ollama, streaming) ----------

#[tauri::command]
async fn send_message(window: tauri::Window, db: State<'_, Db>, payload: ChatRequest) -> Result<(), String> {
    // Persist the user's message immediately.
    {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        save_message_internal(&conn, &payload.chat_id, "user", &payload.message).map_err(|e| e.to_string())?;
    }

    let client = Client::new();
    let ollama_url = "http://localhost:11434/api/chat";

    let response = client
        .post(ollama_url)
        .json(&serde_json::json!({
            "model": payload.model,
            "messages": payload.history,
            "stream": true
        }))
        .send()
        .await
        .map_err(|e| format!("Couldn't reach Ollama — is it running? ({e})"))?;

    let mut stream = response.bytes_stream();
    let mut full_reply = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        let text = String::from_utf8_lossy(&chunk);

        for line in text.lines() {
            if line.trim().is_empty() {
                continue;
            }

            if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                if let Some(content) = json["message"]["content"].as_str() {
                    if !content.is_empty() {
                        full_reply.push_str(content);
                        let _ = window.emit("chat-stream", content);
                    }
                }

                if json["done"].as_bool().unwrap_or(false) {
                    // Persist the full assistant reply once streaming finishes.
                    let conn = db.0.lock().map_err(|e| e.to_string())?;
                    save_message_internal(&conn, &payload.chat_id, "assistant", &full_reply)
                        .map_err(|e| e.to_string())?;

                    let _ = window.emit("chat-stream-end", payload.chat_id.clone());
                    return Ok(());
                }
            }
        }
    }

    // Stream ended without an explicit "done" — still persist what we got.
    if !full_reply.is_empty() {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        save_message_internal(&conn, &payload.chat_id, "assistant", &full_reply).map_err(|e| e.to_string())?;
    }
    let _ = window.emit("chat-stream-end", payload.chat_id);
    Ok(())
}

// ---------- Commands: cloud providers ----------

#[tauri::command]
fn save_provider_key(db: State<Db>, provider: String, api_key: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO providers (name, api_key, connected) VALUES (?1, ?2, 1)
         ON CONFLICT(name) DO UPDATE SET api_key = excluded.api_key, connected = 1",
        params![provider, api_key],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_providers(db: State<Db>) -> Result<Vec<ProviderInfo>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT name, connected FROM providers")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ProviderInfo {
                name: row.get(0)?,
                connected: row.get::<_, i64>(1)? == 1,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_provider_key(provider: String, api_key: String) -> Result<bool, String> {
    let client = Client::new();
    // Minimal "does this key work" probe per provider. Extend as needed.
    let ok = match provider.as_str() {
        "openai" => client
            .get("https://api.openai.com/v1/models")
            .bearer_auth(&api_key)
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false),
        "anthropic" => client
            .get("https://api.anthropic.com/v1/models")
            .header("x-api-key", &api_key)
            .header("anthropic-version", "2023-06-01")
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false),
        _ => !api_key.trim().is_empty(), // best-effort fallback for other providers
    };
    Ok(ok)
}

// Minimal non-streaming cloud completion, used when a chat's model belongs to
// a connected cloud provider rather than a local Ollama model. Wire this up
// from the frontend by checking the model's provider before calling
// `send_message` (Ollama) vs `send_cloud_message` (cloud).
#[tauri::command]
async fn send_cloud_message(
    db: State<'_, Db>,
    provider: String,
    model: String,
    chat_id: String,
    message: String,
    history: Vec<Message>,
) -> Result<String, String> {
    let api_key = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT api_key FROM providers WHERE name = ?1",
            params![provider],
            |row| row.get::<_, String>(0),
        )
        .map_err(|_| format!("{provider} isn't connected yet."))?
    };

    {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        save_message_internal(&conn, &chat_id, "user", &message).map_err(|e| e.to_string())?;
    }

    let client = Client::new();
    let reply = match provider.as_str() {
        "openai" => {
            let resp = client
                .post("https://api.openai.com/v1/chat/completions")
                .bearer_auth(&api_key)
                .json(&serde_json::json!({ "model": model, "messages": history }))
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json::<serde_json::Value>()
                .await
                .map_err(|e| e.to_string())?;
            resp["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or("")
                .to_string()
        }
        "anthropic" => {
            let resp = client
                .post("https://api.anthropic.com/v1/messages")
                .header("x-api-key", &api_key)
                .header("anthropic-version", "2023-06-01")
                .json(&serde_json::json!({
                    "model": model,
                    "max_tokens": 1024,
                    "messages": history
                }))
                .send()
                .await
                .map_err(|e| e.to_string())?
                .json::<serde_json::Value>()
                .await
                .map_err(|e| e.to_string())?;
            resp["content"][0]["text"].as_str().unwrap_or("").to_string()
        }
        _ => return Err(format!("Cloud provider \"{provider}\" isn't wired up yet.")),
    };

    let conn = db.0.lock().map_err(|e| e.to_string())?;
    save_message_internal(&conn, &chat_id, "assistant", &reply).map_err(|e| e.to_string())?;

    Ok(reply)
}

// ---------- Misc ----------

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! Rust backend is alive.", name)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
            let db_path = app_dir.join("infiere.db");

            let conn = Connection::open(db_path).expect("failed to open sqlite db");
            init_db(&conn).expect("failed to run migrations");
            app.manage(Db(Mutex::new(conn)));

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            println!("Infiere Tauri backend started!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            send_message,
            list_models,
            create_chat,
            list_chats,
            delete_chat,
            get_messages,
            save_message,
            save_provider_key,
            list_providers,
            validate_provider_key,
            send_cloud_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}