import { useState } from "react";
import { ArrowLeft, ArrowUp, Code2, Eye, Copy, Download, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SAMPLE_HTML = `<div style="font-family: Inter, sans-serif; padding: 48px; background: linear-gradient(135deg,#1a0f2e,#2a1340); min-height: 100%; color: white;">
  <div style="max-width:420px;margin:0 auto;text-align:center;">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:rgba(167,139,250,0.15);margin-bottom:20px;">
      <span style="font-size:24px;">✨</span>
    </div>
    <h1 style="font-size:28px;margin:0 0 12px;">Pricing, simplified</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 28px;">Pick a plan that grows with you.</p>
    <div style="display:flex;gap:12px;justify-content:center;">
      <div style="flex:1;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;background:rgba(255,255,255,0.03);">
        <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 6px;">Starter</p>
        <p style="font-size:22px;margin:0;">$9<span style="font-size:12px;color:rgba(255,255,255,0.4);">/mo</span></p>
      </div>
      <div style="flex:1;border:1px solid rgba(167,139,250,0.4);border-radius:16px;padding:20px;background:rgba(167,139,250,0.1);">
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0 0 6px;">Pro</p>
        <p style="font-size:22px;margin:0;">$29<span style="font-size:12px;color:rgba(255,255,255,0.4);">/mo</span></p>
      </div>
    </div>
  </div>
</div>`;

const INITIAL_MESSAGES = (prompt: string): Message[] => [
  { id: "m1", role: "user", content: prompt },
  {
    id: "m2",
    role: "assistant",
    content: "Here's a first pass — a centered pricing layout with two tiers and a highlighted plan. Tell me what to adjust.",
  },
];

interface ArtifactsWorkspaceViewProps {
  initialPrompt: string;
  onBack: () => void;
}

export default function ArtifactsWorkspaceView({ initialPrompt, onBack }: ArtifactsWorkspaceViewProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES(initialPrompt));
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: draft.trim() }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: "Updated the artifact to reflect that change." },
      ]);
    }, 600);
  };

  return (
    <div className="flex h-full flex-1">
      {/* chat, left */}
      <div className="flex w-[420px] shrink-0 flex-col border-r border-white/[0.06] bg-[#150a24]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-4">
          <button onClick={onBack} className="rounded-md p-1 text-white/40 transition hover:bg-white/[0.06] hover:text-white/80">
            <ArrowLeft size={15} />
          </button>
          <p className="truncate text-[13.5px] font-medium text-white/80">Pricing page artifact</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    message.role === "user"
                      ? "bg-violet-600 text-white"
                      : "border border-white/[0.08] bg-white/[0.04] text-white/85"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="mt-1 shrink-0 text-violet-300" />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask for a change…"
                rows={1}
                className="max-h-28 w-full resize-none bg-transparent text-[13.5px] text-white/85 placeholder:text-white/35 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="shrink-0 rounded-full bg-violet-600 p-1.5 text-white transition hover:bg-violet-500 disabled:opacity-40"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* preview / code, right */}
      <div className="flex flex-1 flex-col bg-[#0f0820]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition ${
                tab === "preview" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Eye size={13} />
              Preview
            </button>
            <button
              onClick={() => setTab("code")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition ${
                tab === "code" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Code2 size={13} />
              Code
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.08]">
              <RefreshCw size={13} />
              Refresh
            </button>
            <button className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.08]">
              <Copy size={13} />
              Copy
            </button>
            <button className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.08]">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          {tab === "preview" ? (
            <div className="h-full overflow-hidden rounded-xl border border-white/[0.08] bg-white">
              <iframe title="Artifact preview" srcDoc={SAMPLE_HTML} className="h-full w-full" sandbox="allow-scripts" />
            </div>
          ) : (
            <pre className="h-full overflow-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 text-[12.5px] leading-relaxed text-white/75">
              <code>{SAMPLE_HTML}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}