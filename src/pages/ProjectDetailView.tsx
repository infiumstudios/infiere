import { ArrowLeft, MessageSquare, Plus, FileText, FolderKanban } from "lucide-react";
import { PROJECTS } from "./ProjectsView";

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onOpenChat: (chatId: string) => void;
}

const PROJECT_CHATS = [
  { id: "p1", title: "Hero composition pass 3", timestamp: "2h ago" },
  { id: "p2", title: "Color palette for empty states", timestamp: "Yesterday" },
  { id: "p3", title: "Export presets for social", timestamp: "3d ago" },
];

const PROJECT_FILES = [
  { name: "brand-guidelines.pdf", size: "1.2 MB" },
  { name: "reference-moodboard.png", size: "640 KB" },
];

export default function ProjectDetailView({ projectId, onBack, onOpenChat }: ProjectDetailViewProps) {
  const project = PROJECTS.find((p) => p.id === projectId);

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-[13px] text-white/45 transition hover:text-white/80"
        >
          <ArrowLeft size={14} />
          Back to projects
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <FolderKanban size={18} />
            </div>
            <div>
              <h1 className="font-serif text-[20px] text-white/90">{project?.name ?? "Project"}</h1>
              <p className="text-[12.5px] text-white/40">{project?.description}</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500">
            <Plus size={15} />
            New chat in project
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
            Chats in this project
          </p>
          <div className="space-y-1">
            {PROJECT_CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onOpenChat(chat.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
                  <MessageSquare size={14} />
                </div>
                <span className="flex-1 truncate text-[14px] text-white/85">{chat.title}</span>
                <span className="text-[12px] text-white/30">{chat.timestamp}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="w-[260px] shrink-0 border-l border-white/[0.06] px-5 py-6">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
            Project knowledge
          </p>
          <div className="space-y-1.5">
            {PROJECT_FILES.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2"
              >
                <FileText size={14} className="shrink-0 text-violet-300" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] text-white/80">{file.name}</p>
                  <p className="text-[11px] text-white/35">{file.size}</p>
                </div>
              </div>
            ))}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] py-2 text-[12.5px] text-white/40 transition hover:border-violet-400/30 hover:text-white/70">
              <Plus size={13} />
              Add files
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}