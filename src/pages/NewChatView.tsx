import { useEffect, useState } from "react";
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
} from "lucide-react";

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

const QUICK_ACTIONS = [
  { label: "Create image", icon: ImageIcon },
  { label: "Brainstorm", icon: Lightbulb },
  { label: "Make a plan", icon: FileText },
];

const testChat = async () => {
  const history = [
    { role: "user", content: "Hello, who are you?" }
  ];

  try {
    const response = await invoke<string>('send_message', {
      payload: {
        chat_id: "test-1",
        message: "Hello, who are you?",
        model: "llama3.2",        // change to a model you have
        history
      }
    });
    console.log("Ollama response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function NewChatView() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[#150a24]">
      {/* layered ambient glow, echoes the hero in the reference */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/25 blur-[120px]" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      {/* top bar — model switcher only; Configuration / Export removed */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-6">
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-white/70 transition hover:bg-white/[0.07]">
          Nexus AI v6.0
          <span className="text-white/40">⌄</span>
        </button>
      </div>

      {/* centered hero + composer */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <h1 className="mb-12 max-w-xl text-center font-serif text-[34px] font-normal leading-tight text-white/90">
          Ready to create something new?
        </h1>

        <div className="w-full max-w-[640px]">
          {/* quick action chips */}
          <div className="mb-3 flex items-center justify-center gap-2.5">
            {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[13px] text-white/75 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
              >
                {label}
                <Icon size={14} className="text-violet-300" />
              </button>
            ))}
          </div>

          {/* composer */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_60px_-20px_rgba(124,58,237,0.35)] backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="mt-1 shrink-0 text-violet-300" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                  disabled={!prompt.trim()}
                  onClick={testChat} 
                  className="rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* signature mark, bottom-right, mirrors the reference */}
      <div className="absolute bottom-6 right-6 z-10 opacity-70">
        <Sparkles size={22} className="text-white/70" />
      </div>
    </div>
  );
}