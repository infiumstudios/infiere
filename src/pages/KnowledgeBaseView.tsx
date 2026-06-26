import { useMemo, useState } from "react";
import { Plus, Library, MoreHorizontal, Clock, Search, FileText, Globe, GitBranch, File } from "lucide-react";

export interface SourceItem {
  id: string;
  name: string;
  type: "pdf" | "doc" | "url" | "repo";
  size?: string;
  addedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  updated: string;
  accent: string;
  sources: SourceItem[];
}

export const COLLECTIONS: Collection[] = [
  {
    id: "1",
    name: "Product Research",
    description: "Competitive teardown docs, user interview notes, and reference URLs.",
    updated: "2h ago",
    accent: "from-fuchsia-500/30 to-violet-700/30",
    sources: [
      { id: "s1", name: "competitor-teardown.pdf", type: "pdf", size: "2.4 MB", addedAt: "2d ago" },
      { id: "s2", name: "interview-notes.docx", type: "doc", size: "180 KB", addedAt: "3d ago" },
      { id: "s3", name: "nngroup.com/articles/sidebar-nav", type: "url", addedAt: "5d ago" },
    ],
  },
  {
    id: "2",
    name: "Engineering Wiki",
    description: "Internal architecture docs and the main monorepo for reference.",
    updated: "1d ago",
    accent: "from-violet-500/30 to-indigo-700/30",
    sources: [
      { id: "s4", name: "infiere/infiere-app", type: "repo", addedAt: "1d ago" },
      { id: "s5", name: "architecture-overview.pdf", type: "pdf", size: "860 KB", addedAt: "1w ago" },
    ],
  },
  {
    id: "3",
    name: "Thesis & Papers",
    description: "Academic references collected while researching context windows.",
    updated: "4d ago",
    accent: "from-indigo-500/30 to-blue-700/30",
    sources: [
      { id: "s6", name: "thesis.pdf", type: "pdf", size: "4.1 MB", addedAt: "4d ago" },
      { id: "s7", name: "attention-is-all-you-need.pdf", type: "pdf", size: "1.2 MB", addedAt: "2w ago" },
      { id: "s8", name: "arxiv.org/abs/2305.14314", type: "url", addedAt: "2w ago" },
      { id: "s9", name: "lit-review-notes.docx", type: "doc", size: "92 KB", addedAt: "3w ago" },
    ],
  },
];

const TYPE_ICON: Record<SourceItem["type"], typeof FileText> = {
  pdf: FileText,
  doc: File,
  url: Globe,
  repo: GitBranch,
};

interface KnowledgeBaseViewProps {
  onOpenCollection: (collectionId: string) => void;
}

export default function KnowledgeBaseView({ onOpenCollection }: KnowledgeBaseViewProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      COLLECTIONS.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <h1 className="font-serif text-[22px] text-white/90">Knowledge Base</h1>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/45">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections…"
              className="w-48 bg-transparent text-white/80 placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500">
            <Plus size={15} />
            Add Collection
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-[13.5px] text-white/35">No collections match "{query}".</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((collection) => (
              <button
                key={collection.id}
                onClick={() => onOpenCollection(collection.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition hover:border-violet-400/30 hover:bg-white/[0.05]"
              >
                <div
                  className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${collection.accent} blur-2xl`}
                />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Library size={16} />
                  </div>
                  <span className="rounded-md p-1 text-white/0 transition group-hover:text-white/50 hover:bg-white/[0.07]">
                    <MoreHorizontal size={15} />
                  </span>
                </div>
                <h3 className="relative z-10 mt-3 truncate text-[15px] font-medium text-white/90">
                  {collection.name}
                </h3>
                <p className="relative z-10 mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/45">
                  {collection.description}
                </p>

                <div className="relative z-10 mt-3 flex items-center gap-1.5">
                  {collection.sources.slice(0, 4).map((source) => {
                    const Icon = TYPE_ICON[source.type];
                    return (
                      <span
                        key={source.id}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-white/45"
                      >
                        <Icon size={12} />
                      </span>
                    );
                  })}
                  {collection.sources.length > 4 && (
                    <span className="text-[11px] text-white/35">+{collection.sources.length - 4}</span>
                  )}
                </div>

                <div className="relative z-10 mt-4 flex items-center gap-3 text-[12px] text-white/35">
                  <span>{collection.sources.length} sources</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {collection.updated}
                  </span>
                </div>
              </button>
            ))}

            <button className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] text-white/35 transition hover:border-violet-400/30 hover:text-white/70">
              <Plus size={20} />
              <span className="text-[13px]">Add Collection</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}