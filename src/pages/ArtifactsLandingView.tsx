import { useState } from "react";
import { Sparkles, ArrowUp, Code2, Layers } from "lucide-react";

const TEMPLATES = [
  { label: "Landing page", icon: Layers },
  { label: "Dashboard UI", icon: Layers },
  { label: "React component", icon: Code2 },
  { label: "Interactive game", icon: Code2 },
];

interface ArtifactsLandingViewProps {
  onCreate: (prompt: string) => void;
}

export default function ArtifactsLandingView({ onCreate }: ArtifactsLandingViewProps) {
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    if (!prompt.trim()) return;
    onCreate(prompt.trim());
  };

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-[#150a24] px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/25 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[640px]">
        <h1 className="mb-3 text-center font-serif text-[30px] text-white/90">What should we build?</h1>
        <p className="mb-10 text-center text-[13.5px] text-white/40">
          Describe an app, page, or component — Infiere will build it live alongside the chat.
        </p>

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          {TEMPLATES.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setPrompt(`Build a ${label.toLowerCase()}`)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[13px] text-white/70 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
            >
              {label}
              <Icon size={14} className="text-violet-300" />
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_60px_-20px_rgba(124,58,237,0.35)]">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="mt-1 shrink-0 text-violet-300" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a pricing page with three tiers and a toggle for monthly/yearly"
              rows={2}
              className="max-h-40 w-full resize-none bg-transparent text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={submit}
              disabled={!prompt.trim()}
              className="rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}