import { Search, MessageSquare, Star, MoreHorizontal } from "lucide-react";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  starred?: boolean;
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
      },
      {
        id: "2",
        title: "Gradient accent for dark UI",
        preview: "Settled on a violet-to-fuchsia glow behind the hero headline.",
        timestamp: "9:14 AM",
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
      },
      {
        id: "4",
        title: "Compare mode wireframe",
        preview: "Side-by-side layout for two model outputs with a synced scroll.",
        timestamp: "1:08 PM",
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
      },
      {
        id: "6",
        title: "Settings panel sketch",
        preview: "Grouped account, model defaults, and privacy controls.",
        timestamp: "Sun",
      },
    ],
  },
];

export default function ChatsView() {
  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <h1 className="font-serif text-[22px] text-white/90">Chats</h1>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/45">
          <Search size={14} />
          <input
            placeholder="Search your chats…"
            className="w-56 bg-transparent placeholder:text-white/35 focus:outline-none"
          />
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((chat) => (
                <button
                  key={chat.id}
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
