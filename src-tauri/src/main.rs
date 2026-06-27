// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::time::Duration;
use tauri::Emitter;
use futures_util::StreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,      // "user" | "assistant" | "system"
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub chat_id: String,
    pub message: String,
    pub model: String,     // e.g. "llama3.2"
    pub history: Vec<Message>,
}

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}! Rust backend is alive.", name)
}

// Simple Ollama chat (non-streaming for now)
#[tauri::command]
async fn send_message(
    window: tauri::Window,
    payload: ChatRequest,
) -> Result<(), String> {
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
        .map_err(|e| e.to_string())?;

    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        let text = String::from_utf8_lossy(&chunk);

        // Ollama streams JSON objects line by line
        for line in text.lines() {
            if line.trim().is_empty() { continue; }
            
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                if let Some(content) = json["message"]["content"].as_str() {
                    if !content.is_empty() {
                        // Emit to frontend in real-time
                        let _ = window.emit("chat-stream", content);
                    }
                }
                
                // Check if done
                if json["done"].as_bool().unwrap_or(false) {
                    let _ = window.emit("chat-stream-end", payload.chat_id);
                    return Ok(());
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
async fn list_models() -> Result<Vec<String>, String> {
    let client = Client::new();
    let response = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    
    let models = data["models"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter_map(|m| m["name"].as_str().map(|s| s.to_string()))
        .collect();

    Ok(models)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
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
            list_models
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}