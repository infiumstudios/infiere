import { useMemo, useState } from "react";
import { Search, MessageSquare, Star, MoreHorizontal } from "lucide-react";
import ChatFilterBar, { type ChatFilters, EMPTY_FILTERS } from "../components/filterbar/ChatFilterbar";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  starred?: boolean;
  project?: string;
  model?: string;
  hasFiles?: ("pdf" | "image" | "document")[];
}

const GROUPS: { label: string; items: ChatItem[] }[] = [
  {
    label: "Today",
    items: [
      {
        id: "1",
        title: "Sidebar navigation patterns",
        preview: "Comparing collapse behavior across desktop and mobile breakpoints…",
        timestamp: "11:32 AM",
        starred: true,
        project: "Presentation",
        model: "Nexus AI v6.0",
        hasFiles: ["image"],
      },
      {
        id: "2",
        title: "Gradient accent for dark UI",
        preview: "Settled on a violet-to-fuchsia glow behind the hero headline.",
        timestamp: "9:14 AM",
        project: "Image",
        model: "Nexus AI v6.0",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        id: "3",
        title: "Onboarding flow copy",
        preview: "Drafted empty-state language for the Knowledge Base tab.",
        timestamp: "4:52 PM",
        model: "Nexus AI v5.2",
      },
      {
        id: "4",
        title: "Compare mode wireframe",
        preview: "Side-by-side layout for two model outputs with a synced scroll.",
        timestamp: "1:08 PM",
        hasFiles: ["document"],
      },
    ],
  },
  {
    label: "Previous 7 days",
    items: [
      {
        id: "5",
        title: "Project structure for Image workspace",
        preview: "Folders for generated assets, references, and prompt presets.",
        timestamp: "Mon",
        project: "Image",
        starred: true,
        hasFiles: ["pdf", "image"],
      },
      {
        id: "6",
        title: "Settings panel sketch",
        preview: "Grouped account, model defaults, and privacy controls.",
        timestamp: "Sun",
        model: "Nexus Mini",
      },
    ],
  },
];

interface ChatsViewProps {
  onOpenChat: (chatId: string) => void;
}

export default function ChatsView({ onOpenChat }: ChatsViewProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ChatFilters>(EMPTY_FILTERS);

  const filteredGroups = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((chat) => {
        if (query && !chat.title.toLowerCase().includes(query.toLowerCase())) return false;
        if (filters.project && chat.project !== filters.project) return false;
        if (filters.model && chat.model !== filters.model) return false;
        if (filters.starredOnly && !chat.starred) return false;
        if (
          filters.fileTypes.length &&
          !filters.fileTypes.some((t) => chat.hasFiles?.includes(t))
        )
          return false;
        if (filters.dateRange === "today" && group.label !== "Today") return false;
        return true;
      }),
    })).filter((group) => group.items.length > 0);
  }, [query, filters]);

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <h1 className="font-serif text-[22px] text-white/90">Chats</h1>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/45">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chats…"
              className="w-56 bg-transparent text-white/80 placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <ChatFilterBar filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filteredGroups.length === 0 && (
          <p className="mt-12 text-center text-[13.5px] text-white/35">
            No chats match these filters.
          </p>
        )}
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onOpenChat(chat.id)}
                  className="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-medium text-white/85">
                        {chat.title}
                      </span>
                      {chat.starred && (
                        <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <p className="truncate text-[12.5px] text-white/40">{chat.preview}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] text-white/30">{chat.timestamp}</span>
                    <span className="rounded-md p-1 text-white/0 transition group-hover:text-white/50 hover:bg-white/[0.07]">
                      <MoreHorizontal size={15} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}