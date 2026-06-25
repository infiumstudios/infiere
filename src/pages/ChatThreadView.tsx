import { useState } from "react";
import { ArrowLeft, PanelRightOpen, PanelRightClose, Paperclip, ArrowUp, Sparkles } from "lucide-react";
import ContextInspectorPanel, { type ContextItem } from "./ContextInspectorPanel";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MESSAGES: Message[] = [
  { id: "m1", role: "user", content: "Can you summarize the key points from thesis.pdf?" },
  {
    id: "m2",
    role: "assistant",
    content:
      "Here's a summary of the thesis: it argues that collapsible navigation reduces cognitive load on dense dashboards, backed by a small usability study across 12 participants.",
  },
  { id: "m3", role: "user", content: "Good — turn that into three bullet points for the README." },
];

const INITIAL_CONTEXT: ContextItem[] = [
  { id: "c1", name: "thesis.pdf", type: "pdf", tokens: 4820 },
  { id: "c2", name: "notes.md", type: "note", tokens: 612 },
  { id: "c3", name: "moodboard.png", type: "image", tokens: 1100 },
];

interface ChatThreadViewProps {
  chatId: string;
  onBack: () => void;
}

export default function ChatThreadView({ chatId, onBack }: ChatThreadViewProps) {
  const [contextOpen, setContextOpen] = useState(true);
  const [contextItems, setContextItems] = useState<ContextItem[]>(INITIAL_CONTEXT);
  const [draft, setDraft] = useState("");

  const removeContextItem = (id: string) => {
    setContextItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-1 flex-col bg-[#150a24]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-white/45 transition hover:text-white/80"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <p className="truncate text-[13.5px] font-medium text-white/80">Chat {chatId}</p>
          <button
            onClick={() => setContextOpen((o) => !o)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition ${
              contextOpen
                ? "border-violet-400/40 bg-violet-500/15 text-white"
                : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07]"
            }`}
          >
            {contextOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            Context inspector
          </button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-5">
            {MESSAGES.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
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

        {/* composer */}
        <div className="px-6 pb-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
            <div className="flex items-start gap-2">
              <Sparkles size={15} className="mt-1 shrink-0 text-violet-300" />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
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
                disabled={!draft.trim()}
                className="rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {contextOpen && (
        <ContextInspectorPanel
          items={contextItems}
          onRemove={removeContextItem}
          onClose={() => setContextOpen(false)}
        />
      )}
    </div>
  );
}