import { useMemo, useState } from "react";
import { Search, Download, Check } from "lucide-react";
import { MODEL_CATALOG } from "../components/data/ModelsData";

export default function DiscoverModelsView() {
  const [query, setQuery] = useState("");
  const [downloaded, setDownloaded] = useState<Set<string>>(
    new Set(MODEL_CATALOG.filter((m) => m.installed).map((m) => m.id))
  );

  const filtered = useMemo(
    () => MODEL_CATALOG.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const toggleDownload = (id: string) => {
    setDownloaded((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/45">
        <Search size={14} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models…"
          className="w-full bg-transparent text-white/80 placeholder:text-white/35 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        {filtered.map((model, i) => {
          const isDownloaded = downloaded.has(model.id);
          return (
            <div
              key={model.id}
              className={`flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.03] ${
                i !== filtered.length - 1 ? "border-b border-white/[0.06]" : ""
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${model.dotColor}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-white/85">{model.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-white/35">
                  <span>{model.task}</span>
                  {model.quant && (
                    <>
                      <span className="text-white/15">•</span>
                      <span>Type: {model.quant}</span>
                    </>
                  )}
                  {model.ram && (
                    <>
                      <span className="text-white/15">•</span>
                      <span>RAM: {model.ram}</span>
                    </>
                  )}
                  {model.context && (
                    <>
                      <span className="text-white/15">•</span>
                      <span>Context: {model.context}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleDownload(model.id)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  isDownloaded
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                }`}
                aria-label={isDownloaded ? "Downloaded" : "Download model"}
              >
                {isDownloaded ? <Check size={15} /> : <Download size={15} />}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-white/35">No models match "{query}".</p>
        )}
      </div>
    </div>
  );
}