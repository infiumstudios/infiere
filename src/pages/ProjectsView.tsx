import { Plus, FolderKanban, MoreHorizontal, Clock } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  chatCount: number;
  updated: string;
  accent: string;
}

const PROJECTS: Project[] = [
  {
    id: "1",
    name: "Image",
    description: "Generated assets, references, and prompt presets for visual work.",
    chatCount: 12,
    updated: "2h ago",
    accent: "from-fuchsia-500/30 to-violet-700/30",
  },
  {
    id: "2",
    name: "Presentation",
    description: "Slide decks and talking points for the Q3 product walkthrough.",
    chatCount: 6,
    updated: "1d ago",
    accent: "from-violet-500/30 to-indigo-700/30",
  },
  {
    id: "3",
    name: "Rlaet",
    description: "Research notes and drafts for the Rlaet launch brief.",
    chatCount: 9,
    updated: "3d ago",
    accent: "from-indigo-500/30 to-blue-700/30",
  },
  {
    id: "4",
    name: "Image",
    description: "A second image workspace, kept separate for client review.",
    chatCount: 3,
    updated: "5d ago",
    accent: "from-rose-500/30 to-fuchsia-700/30",
  },
];

export default function ProjectsView() {
  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-8 py-5">
        <h1 className="font-serif text-[22px] text-white/90">Projects</h1>
        <button className="flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500">
          <Plus size={15} />
          New project
        </button>
      </div>

      {/* grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition hover:border-violet-400/30 hover:bg-white/[0.05]"
            >
              <div
                className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${project.accent} blur-2xl`}
              />
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <FolderKanban size={16} />
                </div>
                <span className="rounded-md p-1 text-white/0 transition group-hover:text-white/50 hover:bg-white/[0.07]">
                  <MoreHorizontal size={15} />
                </span>
              </div>
              <h3 className="relative z-10 mt-3 truncate text-[15px] font-medium text-white/90">
                {project.name}
              </h3>
              <p className="relative z-10 mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/45">
                {project.description}
              </p>
              <div className="relative z-10 mt-4 flex items-center gap-3 text-[12px] text-white/35">
                <span>{project.chatCount} chats</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {project.updated}
                </span>
              </div>
            </button>
          ))}

          {/* add-new tile */}
          <button className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] text-white/35 transition hover:border-violet-400/30 hover:text-white/70">
            <Plus size={20} />
            <span className="text-[13px]">Create a project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
