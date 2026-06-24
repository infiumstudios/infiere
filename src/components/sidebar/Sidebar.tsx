import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  MessageSquare,
  FolderKanban,
  Layers,
  BookOpen,
  GitCompare,
  Settings,
  Sparkles,
} from "lucide-react";

export type NavKey =
  | "new-chat"
  | "chats"
  | "projects"
  | "artifacts"
  | "knowledge-base"
  | "compare"
  | "settings";

interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PRIMARY_ITEMS: NavItem[] = [
  { key: "new-chat", label: "New chat", icon: SquarePen },
];

const NAV_ITEMS: NavItem[] = [
  { key: "chats", label: "Chats", icon: MessageSquare },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "artifacts", label: "Artifacts", icon: Layers },
  { key: "knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { key: "compare", label: "Compare", icon: GitCompare },
];

interface SidebarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-white/[0.06] bg-[#0b0712] transition-[width] duration-300 ease-out ${
        collapsed ? "w-[68px]" : "w-[252px]"
      }`}
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-700/20 blur-3xl" />

      {/* Brand row */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-700 shadow-[0_0_18px_rgba(168,85,247,0.55)]">
            <Sparkles size={14} className="text-white" />
          </div>
          {!collapsed && (
            <span className="truncate font-serif text-[17px] tracking-wide text-white/90">
              Infiere
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* New chat */}
      <div className="relative z-10 mt-5 px-3">
        {PRIMARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-[13.5px] font-medium text-white/85 transition hover:border-violet-400/30 hover:bg-violet-500/10 ${
                collapsed ? "justify-center" : ""
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="shrink-0 text-violet-300" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Nav section */}
      <nav className="relative z-10 mt-6 flex-1 space-y-0.5 overflow-y-auto px-3">
        {!collapsed && (
          <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
            Features
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition ${
                isActive
                  ? "bg-violet-500/15 text-white"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white/85"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={16}
                className={`shrink-0 ${isActive ? "text-violet-300" : "text-white/40 group-hover:text-white/70"}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings, pinned bottom */}
      <div className="relative z-10 mb-4 border-t border-white/[0.06] px-3 pt-3">
        <button
          onClick={() => onNavigate("settings")}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition ${
            active === "settings"
              ? "bg-violet-500/15 text-white"
              : "text-white/55 hover:bg-white/[0.05] hover:text-white/85"
          } ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings
            size={16}
            className={`shrink-0 ${active === "settings" ? "text-violet-300" : "text-white/40"}`}
          />
          {!collapsed && <span className="truncate">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
