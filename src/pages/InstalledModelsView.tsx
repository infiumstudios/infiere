import { useMemo, useState } from "react";
import { Search, Trash2, UploadCloud } from "lucide-react";
import { MODEL_CATALOG } from "../components/data/ModelsData";

export default function InstalledModelsView() {
  const [query, setQuery] = useState("");
  const [installed, setInstalled] = useState(MODEL_CATALOG.filter((m) => m.installed));

  const filtered = useMemo(
    () => installed.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [installed, query]
  );

  const remove = (id: string) => setInstalled((list) => list.filter((m) => m.id !== id));

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500">
          <UploadCloud size={15} />
          Import Model
        </button>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/45">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search installed models…"
            className="w-56 bg-transparent text-white/80 placeholder:text-white/35 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        {filtered.map((model, i) => (
          <div
            key={model.id}
            className={`flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.03] ${
              i !== filtered.length - 1 ? "border-b border-white/[0.06]" : ""
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${model.dotColor}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-white/85">{model.name}</p>
              <p className="text-[11.5px] text-white/35">{model.task}</p>
            </div>
            <button
              onClick={() => remove(model.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20"
              aria-label={`Remove ${model.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-white/35">No installed models match this search.</p>
        )}
      </div>
    </div>
  );
}