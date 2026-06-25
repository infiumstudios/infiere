import { FileText, Image as ImageIcon, StickyNote, X } from "lucide-react";

export interface ContextItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "note" | "document";
  tokens: number;
}

const TYPE_ICON: Record<ContextItem["type"], typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  note: StickyNote,
  document: FileText,
};

interface ContextInspectorPanelProps {
  items: ContextItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export default function ContextInspectorPanel({ items, onRemove, onClose }: ContextInspectorPanelProps) {
  const totalTokens = items.reduce((sum, item) => sum + item.tokens, 0);

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-white/[0.06] bg-[#150a24]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <div>
          <p className="text-[13.5px] font-medium text-white/85">Context</p>
          <p className="text-[11.5px] text-white/35">{totalTokens.toLocaleString()} tokens in use</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
          aria-label="Close context panel"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-[12.5px] text-white/30">
            Nothing is currently included as context.
          </p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-300">
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-white/80">{item.name}</p>
                    <p className="text-[11px] text-white/35">{item.tokens.toLocaleString()} tokens</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 rounded-md p-1 text-white/0 transition group-hover:text-white/45 hover:bg-white/[0.07] hover:text-white/80"
                    aria-label={`Remove ${item.name} from context`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}