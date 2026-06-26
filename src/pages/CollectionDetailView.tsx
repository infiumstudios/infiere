import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  FileText,
  Globe,
  GitBranch,
  File,
  X,
  Library,
} from "lucide-react";
import { COLLECTIONS, type SourceItem } from "./KnowledgeBaseView";

const TYPE_ICON: Record<SourceItem["type"], typeof FileText> = {
  pdf: FileText,
  doc: File,
  url: Globe,
  repo: GitBranch,
};

const TYPE_LABEL: Record<SourceItem["type"], string> = {
  pdf: "PDF document",
  doc: "Document",
  url: "Web URL",
  repo: "Git repository",
};

const ADD_TYPES: { type: SourceItem["type"]; label: string }[] = [
  { type: "pdf", label: "Upload PDF" },
  { type: "doc", label: "Upload Document" },
  { type: "url", label: "Add Web URL" },
  { type: "repo", label: "Connect Git Repo" },
];

interface CollectionDetailViewProps {
  collectionId: string;
  onBack: () => void;
}

export default function CollectionDetailView({ collectionId, onBack }: CollectionDetailViewProps) {
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  const [sources, setSources] = useState<SourceItem[]>(collection?.sources ?? []);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [inspecting, setInspecting] = useState<SourceItem | null>(null);

  const filtered = useMemo(
    () => sources.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [sources, query]
  );

  const removeSource = (id: string) => {
    setSources((list) => list.filter((s) => s.id !== id));
    if (inspecting?.id === id) setInspecting(null);
  };

  const addPlaceholderSource = (type: SourceItem["type"]) => {
    setSources((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        name: type === "url" ? "new-source.com/page" : type === "repo" ? "org/new-repo" : `new-source.${type}`,
        type,
        size: type === "url" || type === "repo" ? undefined : "—",
        addedAt: "just now",
      },
    ]);
    setAddOpen(false);
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-[13px] text-white/45 transition hover:text-white/80"
        >
          <ArrowLeft size={14} />
          Back to knowledge base
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Library size={18} />
            </div>
            <div>
              <h1 className="font-serif text-[20px] text-white/90">{collection?.name ?? "Collection"}</h1>
              <p className="text-[12.5px] text-white/40">{collection?.description}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setAddOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500"
            >
              <Plus size={15} />
              Add Source
            </button>
            {addOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setAddOpen(false)} />
                <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-white/10 bg-[#1a0f2e] p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]">
                  {ADD_TYPES.map(({ type, label }) => {
                    const Icon = TYPE_ICON[type];
                    return (
                      <button
                        key={type}
                        onClick={() => addPlaceholderSource(type)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] text-white/75 transition hover:bg-white/[0.06]"
                      >
                        <Icon size={14} className="text-violet-300" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white/45">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sources…"
              className="w-full bg-transparent text-white/80 placeholder:text-white/35 focus:outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            {filtered.map((source, i) => {
              const Icon = TYPE_ICON[source.type];
              return (
                <button
                  key={source.id}
                  onClick={() => setInspecting(source)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03] ${
                    i !== filtered.length - 1 ? "border-b border-white/[0.06]" : ""
                  } ${inspecting?.id === source.id ? "bg-violet-500/10" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-white/85">{source.name}</p>
                    <p className="text-[11.5px] text-white/35">
                      {TYPE_LABEL[source.type]} · added {source.addedAt}
                    </p>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSource(source.id);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-rose-500/15 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-[13px] text-white/35">No sources match this search.</p>
            )}
          </div>
        </div>

        {/* file info panel */}
        {inspecting && (
          <aside className="w-[300px] shrink-0 border-l border-white/[0.06] px-5 py-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-medium text-white/85">Source info</p>
              <button
                onClick={() => setInspecting(null)}
                className="rounded-md p-1 text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                {(() => {
                  const Icon = TYPE_ICON[inspecting.type];
                  return <Icon size={18} />;
                })()}
              </div>
              <p className="break-all text-[13.5px] font-medium text-white/85">{inspecting.name}</p>
              <div className="space-y-1.5 text-[12.5px]">
                <div className="flex justify-between text-white/45">
                  <span>Type</span>
                  <span className="text-white/75">{TYPE_LABEL[inspecting.type]}</span>
                </div>
                {inspecting.size && (
                  <div className="flex justify-between text-white/45">
                    <span>Size</span>
                    <span className="text-white/75">{inspecting.size}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/45">
                  <span>Added</span>
                  <span className="text-white/75">{inspecting.addedAt}</span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}