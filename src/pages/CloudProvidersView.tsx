import { useState } from "react";
import { Cloud, Check, X, Loader2, ShieldCheck } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  accent: string;
}

const PROVIDERS: Provider[] = [
  { id: "openai", name: "OpenAI", accent: "from-emerald-500/30 to-teal-700/30" },
  { id: "anthropic", name: "Anthropic", accent: "from-orange-500/30 to-amber-700/30" },
  { id: "google", name: "Google", accent: "from-blue-500/30 to-sky-700/30" },
  { id: "openrouter", name: "OpenRouter", accent: "from-violet-500/30 to-fuchsia-700/30" },
];

interface CostBreakdown {
  input: number;
  output: number;
}

const MOCK_COSTS: Record<string, CostBreakdown> = {
  openai: { input: 0.85, output: 1.72 },
  anthropic: { input: 1.1, output: 2.4 },
};

type ValidationState = "idle" | "validating" | "valid" | "invalid";

function ConnectDialog({ provider, onClose, onSave }: { provider: Provider; onClose: () => void; onSave: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [validation, setValidation] = useState<ValidationState>("idle");

  const validate = () => {
    if (!apiKey.trim()) return;
    setValidation("validating");
    setTimeout(() => setValidation(apiKey.trim().length > 8 ? "valid" : "invalid"), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a0f2e] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-white/90">{provider.name} API Key</h2>
          <button onClick={onClose} className="rounded-md p-1 text-white/40 transition hover:bg-white/[0.07] hover:text-white/80">
            <X size={16} />
          </button>
        </div>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setValidation("idle");
          }}
          placeholder="sk-…"
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-white/85 placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
        />

        <button
          onClick={validate}
          disabled={!apiKey.trim() || validation === "validating"}
          className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] py-2.5 text-[13px] text-white/70 transition hover:bg-white/[0.09] disabled:opacity-40"
        >
          {validation === "validating" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Validating…
            </>
          ) : (
            "Validate"
          )}
        </button>

        {validation === "valid" && (
          <p className="mb-3 flex items-center gap-1.5 text-[12.5px] text-emerald-400">
            <ShieldCheck size={14} />
            Key looks valid.
          </p>
        )}
        {validation === "invalid" && (
          <p className="mb-3 flex items-center gap-1.5 text-[12.5px] text-rose-400">
            <X size={14} />
            That key couldn't be verified.
          </p>
        )}

        <button
          onClick={onSave}
          disabled={validation !== "valid"}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function CostCard({ providerName, costs }: { providerName: string; costs: CostBreakdown }) {
  const total = costs.input + costs.output;
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="mb-3 text-[13px] font-medium text-white/80">Cost Tracking: {providerName}</p>
      <p className="mb-3 text-[11px] uppercase tracking-wider text-white/30">This Month</p>
      <div className="space-y-2 text-[13px]">
        <div className="flex items-center justify-between text-white/60">
          <span>Input</span>
          <span className="text-white/85">${costs.input.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-white/60">
          <span>Output</span>
          <span className="text-white/85">${costs.output.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.07] pt-2 font-medium text-white">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CloudProvidersView() {
  const [connected, setConnected] = useState<Set<string>>(new Set(["openai"]));
  const [dialogProvider, setDialogProvider] = useState<Provider | null>(null);

  const handleSave = () => {
    if (dialogProvider) setConnected((set) => new Set(set).add(dialogProvider.id));
    setDialogProvider(null);
  };

  return (
    <div className="px-8 py-6">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-white/30">Providers</p>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const isConnected = connected.has(provider.id);
          return (
            <div
              key={provider.id}
              className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4"
            >
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${provider.accent} blur-2xl`} />
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/70">
                  <Cloud size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white/90">{provider.name}</p>
                  {isConnected && (
                    <p className="flex items-center gap-1 text-[11.5px] text-emerald-400">
                      <Check size={11} />
                      Connected
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => (isConnected ? null : setDialogProvider(provider))}
                className={`relative z-10 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition ${
                  isConnected
                    ? "bg-white/[0.06] text-white/40"
                    : "bg-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)] hover:bg-violet-500"
                }`}
                disabled={isConnected}
              >
                {isConnected ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-white/30">Cost Tracking</p>
      {connected.size === 0 ? (
        <p className="text-[13px] text-white/35">Connect a provider to see usage and cost tracking here.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...connected].map((id) => {
            const provider = PROVIDERS.find((p) => p.id === id)!;
            const costs = MOCK_COSTS[id] ?? { input: 0, output: 0 };
            return <CostCard key={id} providerName={provider.name} costs={costs} />;
          })}
        </div>
      )}

      {dialogProvider && (
        <ConnectDialog provider={dialogProvider} onClose={() => setDialogProvider(null)} onSave={handleSave} />
      )}
    </div>
  );
}