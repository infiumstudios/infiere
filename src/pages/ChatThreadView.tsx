import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  PanelRightOpen,
  PanelRightClose,
  Paperclip,
  ArrowUp,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import ContextInspectorPanel, { type ContextItem } from "./ContextInspectorPanel";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface StoredMessage {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  created_at: string;
}

const INITIAL_CONTEXT: ContextItem[] = [];

interface ChatThreadViewProps {
  chatId: string;
  /** If provided, this is sent automatically as the first message on mount
   *  (used when arriving here straight from the New Chat composer). */
  initialMessage?: string;
  onBack: () => void;
}

export default function ChatThreadView({ chatId, initialMessage, onBack }: ChatThreadViewProps) {
  const [contextOpen, setContextOpen] = useState(true);
  const [contextItems, setContextItems] = useState<ContextItem[]>(INITIAL_CONTEXT);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama3.2");
  const [modelsError, setModelsError] = useState<string | null>(null);

  const currentAssistantMessageRef = useRef<string>("");
  const hasSentInitialRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load available local models from Ollama via the Rust backend.
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await invoke<string[]>("list_models");
        setAvailableModels(models);
        setModelsError(null);
        if (models.length > 0 && !models.includes(selectedModel)) {
          setSelectedModel(models[0]);
        }
      } catch (e) {
        setModelsError(typeof e === "string" ? e : "Couldn't load models.");
      }
    };
    loadModels();
  }, []);

  // Load this chat's history from SQLite.
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const rows = await invoke<StoredMessage[]>("get_messages", { chatId });
        setMessages(
          rows.map((r) => ({ id: r.id, role: r.role as Message["role"], content: r.content }))
        );
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    };
    loadHistory();
  }, [chatId]);

  // Streaming listeners from the Rust backend.
  useEffect(() => {
    const unlistenStream = listen<string>("chat-stream", (event) => {
      currentAssistantMessageRef.current += event.payload;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content: currentAssistantMessageRef.current }];
        }
        return prev;
      });
    });

    const unlistenEnd = listen<string>("chat-stream-end", () => {
      currentAssistantMessageRef.current = "";
      setIsLoading(false);
    });

    return () => {
      unlistenStream.then((fn) => fn());
      unlistenEnd.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text || isLoading) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const historyForBackend = messages.concat(userMessage).map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsLoading(true);
    currentAssistantMessageRef.current = "";

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      await invoke("send_message", {
        payload: {
          chat_id: chatId,
          message: text,
          model: selectedModel,
          history: historyForBackend,
        },
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  // Auto-send the message the user typed in the New Chat composer.
  useEffect(() => {
    if (initialMessage && !hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      sendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const removeContextItem = (id: string) => {
    setContextItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-1 flex-col bg-[#150a24]">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-3.5">
          <button
            onClick={onBack}
            className="flex shrink-0 items-center gap-1.5 text-[13px] text-white/45 transition hover:text-white/80"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[13.5px] font-medium text-white/80">Chat {chatId}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* model selector */}
            <div className="relative">
              <button
                onClick={() => setModelMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12.5px] text-white/75 transition hover:bg-white/[0.09]"
              >
                <span className="max-w-[140px] truncate">{selectedModel}</span>
                <ChevronDown size={12} className={`transition ${modelMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {modelMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setModelMenuOpen(false)} />
                  <div className="absolute right-0 z-30 mt-1.5 w-56 rounded-xl border border-white/10 bg-[#1a0f2e] p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
                    {modelsError ? (
                      <p className="px-3 py-2 text-[12px] text-rose-400">{modelsError}</p>
                    ) : availableModels.length === 0 ? (
                      <p className="px-3 py-2 text-[12px] text-white/40">No local models found.</p>
                    ) : (
                      availableModels.map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            setSelectedModel(model);
                            setModelMenuOpen(false);
                          }}
                          className={`block w-full truncate rounded-lg px-3 py-2 text-left text-[12.5px] transition ${
                            model === selectedModel ? "bg-violet-500/20 text-white" : "text-white/65 hover:bg-white/[0.06]"
                          }`}
                        >
                          {model}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* context inspector toggle */}
            <button
              onClick={() => setContextOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition ${
                contextOpen
                  ? "border-violet-400/40 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07]"
              }`}
            >
              {contextOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              <span className="hidden sm:inline">Context</span>
            </button>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-5">
            {messages.length === 0 && (
              <p className="mt-10 text-center text-[13px] text-white/30">Say something to get started.</p>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-violet-600 text-white"
                      : "border border-white/[0.08] bg-white/[0.04] text-white/85"
                  }`}
                >
                  {message.content || (
                    message.role === "assistant" && isLoading ? (
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 [animation-delay:300ms]" />
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* composer */}
        <div className="px-6 pb-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
            <div className="flex items-start gap-2">
              <Sparkles size={15} className="mt-1 shrink-0 text-violet-300" />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Reply…"
                rows={1}
                className="max-h-32 w-full resize-none bg-transparent text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none"
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-[12.5px] text-white/45 transition hover:text-white/80">
                <Paperclip size={14} />
                Attach
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!draft.trim() || isLoading}
                className="rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {contextOpen && (
        <ContextInspectorPanel items={contextItems} onRemove={removeContextItem} onClose={() => setContextOpen(false)} />
      )}
    </div>
  );
}