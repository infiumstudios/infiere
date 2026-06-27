import { useState } from "react";
import {
  ImageIcon,
  Lightbulb,
  FileText,
  Paperclip,
  SlidersHorizontal,
  LayoutGrid,
  Mic,
  ArrowUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

const QUICK_ACTIONS = [
  { label: "Create image", icon: ImageIcon },
  { label: "Brainstorm", icon: Lightbulb },
  { label: "Make a plan", icon: FileText },
];

interface ChatSummary {
  id: string;
  title: string;
  model: string;
  created_at: string;
}

interface NewChatViewProps {
  /** Called once a chat has been created in SQLite, so the app can switch to
   *  ChatThreadView and have it auto-send this same first message. */
  onChatCreated: (chatId: string, firstMessage: string) => void;
  /** Prefilled prompt, e.g. handed off from the Prompt Builder. */
  initialPrompt?: string;
  defaultModel?: string;
}

export default function NewChatView({ onChatCreated, initialPrompt, defaultModel }: NewChatViewProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const text = prompt.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const chat = await invoke<ChatSummary>("create_chat", {
        firstMessage: text,
        model: defaultModel ?? "llama3.2",
      });
      onChatCreated(chat.id, text);
    } catch (e) {
      setError(typeof e === "string" ? e : "Couldn't start a new chat.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/25 blur-[120px]" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-8 pt-6">
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-white/70 transition hover:bg-white/[0.07]">
          {defaultModel ?? "llama3.2"}
          <span className="text-white/40">⌄</span>
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <h1 className="mb-12 max-w-xl text-center font-serif text-[34px] font-normal leading-tight text-white/90">
          Ready to create something new?
        </h1>

        <div className="w-full max-w-[640px]">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setPrompt((p) => p || label)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[13px] text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
              >
                {label}
                <Icon size={14} className="text-violet-300" />
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_60px_-20px_rgba(124,58,237,0.35)] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="mt-1 shrink-0 text-violet-300" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                className="max-h-40 w-full resize-none bg-transparent text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[13px] text-white/45">
                <button className="flex items-center gap-1.5 transition hover:text-white/80">
                  <Paperclip size={15} />
                  Attach
                </button>
                <button className="flex items-center gap-1.5 transition hover:text-white/80">
                  <SlidersHorizontal size={15} />
                  Settings
                </button>
                <button className="flex items-center gap-1.5 transition hover:text-white/80">
                  <LayoutGrid size={15} />
                  Options
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full p-2 text-white/50 transition hover:bg-white/[0.06] hover:text-white/85">
                  <Mic size={16} />
                </button>
                <button
                  onClick={submit}
                  disabled={!prompt.trim() || submitting}
                  className="rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="mt-2 text-center text-[12.5px] text-rose-400">{error}</p>}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 opacity-70">
        <Sparkles size={22} className="text-white/70" />
      </div>
    </div>
  );
}