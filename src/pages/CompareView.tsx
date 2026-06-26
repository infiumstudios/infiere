import { useState } from "react";
import { Plus, X, ChevronDown, ArrowUp, Sparkles, PanelRightClose, PanelRightOpen, BarChart3 } from "lucide-react";

interface ComparePanel {
  id: string;
  model: string;
  response: string;
  metrics: {
    responseTime: string;
    inputTokens: string;
    outputTokens: string;
    totalTokens: string;
    cost: string;
    contextUsed: string;
  };
}

const MODEL_OPTIONS = ["Nexus AI v6.0", "zai-org/GLM-5.2", "Nexus AI v5.2", "Nexus Mini"];

const INITIAL_PANELS: ComparePanel[] = [
  {
    id: "1",
    model: "Nexus AI v6.0",
    response:
      "The Compare page is an experimentation workspace where users can evaluate how different AI models, prompts, configurations, or context sources affect the quality of responses. Instead of opening multiple chats, users can submit a single prompt and compare responses side by side from multiple local or cloud models, test different prompt profiles, adjust parameters like te…",
    metrics: {
      responseTime: "4.2 s",
      inputTokens: "1,245",
      outputTokens: "982",
      totalTokens: "2,227",
      cost: "$0.018",
      contextUsed: "11.2k",
    },
  },
  {
    id: "2",
    model: "zai-org/GLM-5.2",
    response:
      "The page also provides useful metrics such as response time, token usage, estimated cost (for cloud models), and the context used for each response. Its primary purpose is to help users make informed decisions about which model or prompt works best for a particular task while offering complete transparency into how each response was generated. It serves as an AI experimentation lab…",
    metrics: {
      responseTime: "4.2 s",
      inputTokens: "1,245",
      outputTokens: "982",
      totalTokens: "2,227",
      cost: "$0.018",
      contextUsed: "11.2k",
    },
  },
];

function ModelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12.5px] text-white/75 transition hover:bg-white/[0.09]"
      >
        <span className="max-w-[140px] truncate">{value}</span>
        <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-1.5 w-52 rounded-xl border border-white/10 bg-[#1a0f2e] p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]">
            {MODEL_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                className={`block w-full truncate rounded-lg px-3 py-2 text-left text-[12.5px] transition ${
                  m === value ? "bg-violet-500/20 text-white" : "text-white/65 hover:bg-white/[0.06]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-white/45">{label}</span>
      <span className="text-white/85">{value}</span>
    </div>
  );
}

export default function CompareView() {
  const [panels, setPanels] = useState<ComparePanel[]>(INITIAL_PANELS);
  const [prompt, setPrompt] = useState("");
  const [metricsOpen, setMetricsOpen] = useState(true);

  const addPanel = () => {
    if (panels.length >= 4) return;
    setPanels((p) => [
      ...p,
      {
        id: `${Date.now()}`,
        model: MODEL_OPTIONS[0],
        response: "Submit a prompt below to compare this model's response.",
        metrics: {
          responseTime: "—",
          inputTokens: "—",
          outputTokens: "—",
          totalTokens: "—",
          cost: "—",
          contextUsed: "—",
        },
      },
    ]);
  };

  const removePanel = (id: string) => setPanels((p) => p.filter((panel) => panel.id !== id));

  const updateModel = (id: string, model: string) =>
    setPanels((p) => p.map((panel) => (panel.id === id ? { ...panel, model } : panel)));

  return (
    <div className="flex h-full flex-1">
      <div className="flex flex-1 flex-col bg-[#150a24]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
          <h1 className="font-serif text-[22px] text-white/90">Compare</h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={addPanel}
              disabled={panels.length >= 4}
              className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500 disabled:opacity-40"
            >
              <Plus size={15} />
              Add Model
            </button>
            <button
              onClick={() => setMetricsOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition ${
                metricsOpen
                  ? "border-violet-400/40 bg-violet-500/15 text-white"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07]"
              }`}
            >
              {metricsOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              Metrics
            </button>
          </div>
        </div>

        {/* response panels */}
        <div className="flex-1 overflow-x-auto px-8 py-6">
          <div className="flex h-full gap-4">
            {panels.map((panel) => (
              <div
                key={panel.id}
                className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
                  <ModelSelect value={panel.model} onChange={(m) => updateModel(panel.id, m)} />
                  <button
                    onClick={() => removePanel(panel.id)}
                    className="rounded-full p-1 text-white/35 transition hover:bg-white/[0.07] hover:text-white/75"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3.5 py-3 text-[13px] leading-relaxed text-white/70">
                  {panel.response}
                </div>
              </div>
            ))}

            {panels.length < 4 && (
              <button
                onClick={addPanel}
                className="flex w-[220px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] text-white/35 transition hover:border-violet-400/30 hover:text-white/70"
              >
                <Plus size={20} />
                <span className="text-[13px]">Add a model</span>
              </button>
            )}
          </div>
        </div>

        {/* shared prompt composer */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
            <Sparkles size={15} className="shrink-0 text-violet-300" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here"
              className="flex-1 bg-transparent text-[14px] text-white/85 placeholder:text-white/35 focus:outline-none"
            />
            <button
              disabled={!prompt.trim()}
              className="shrink-0 rounded-full bg-violet-600 p-2 text-white shadow-[0_0_16px_rgba(124,58,237,0.6)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* metrics sidebar */}
      {metricsOpen && (
        <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-white/[0.06] bg-gradient-to-b from-violet-700/20 to-[#150a24] px-5 py-6">
          <p className="mb-4 flex items-center gap-2 text-[14px] font-medium text-white/90">
            <BarChart3 size={15} className="text-violet-300" />
            Metrics
          </p>
          <div className="space-y-4">
            {panels.map((panel) => (
              <div key={panel.id} className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-4">
                <p className="mb-2.5 truncate text-[13px] font-medium text-white/90">{panel.model}</p>
                <div className="space-y-1.5">
                  <MetricRow label="Response Time" value={panel.metrics.responseTime} />
                  <MetricRow label="Input Tokens" value={panel.metrics.inputTokens} />
                  <MetricRow label="Output Tokens" value={panel.metrics.outputTokens} />
                  <MetricRow label="Total Tokens" value={panel.metrics.totalTokens} />
                  <MetricRow label="Cost" value={panel.metrics.cost} />
                  <MetricRow label="Context Used" value={panel.metrics.contextUsed} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}