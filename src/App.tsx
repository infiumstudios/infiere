import { useState } from "react";
import { Construction } from "lucide-react";
import Sidebar, { type NavKey } from "./components/sidebar/Sidebar";
import NewChatView from "./pages/NewChatView";
import ChatsView from "./pages/ChatsView";
import ProjectsView from "./pages/ProjectsView";
import ProjectDetailView from "./pages/ProjectDetailView";
import ChatThreadView from "./pages/ChatThreadView";
import PromptBuilderView from "./pages/PromptBuilderView";
import ModelsView from "./pages/ModelsView";
import ArtifactsView from "./pages/ArtifactsView";

const PLACEHOLDER_LABEL: Record<string, string> = {
  "knowledge-base": "Knowledge Base",
  compare: "Compare",
  "plugin-marketplace": "Plugin Marketplace",
  agents: "Agents",
  settings: "Settings",
};

function PlaceholderView({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-[#150a24] text-white/35">
      <Construction size={28} className="text-violet-400/60" />
      <p className="text-[14px]">{label} is on its way.</p>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<NavKey>("new-chat");
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const navigate = (key: NavKey) => {
    setOpenChatId(null);
    setOpenProjectId(null);
    setActive(key);
  };

  const openChat = (chatId: string) => {
    setOpenProjectId(null);
    setOpenChatId(chatId);
  };

  const openProject = (projectId: string) => {
    setOpenChatId(null);
    setOpenProjectId(projectId);
  };

  const renderView = () => {
    if (openChatId) {
      return <ChatThreadView chatId={openChatId} onBack={() => setOpenChatId(null)} />;
    }
    if (openProjectId) {
      return (
        <ProjectDetailView
          projectId={openProjectId}
          onBack={() => setOpenProjectId(null)}
          onOpenChat={openChat}
        />
      );
    }

    switch (active) {
      case "new-chat":
        return <NewChatView />;
      case "chats":
        return <ChatsView onOpenChat={openChat} />;
      case "projects":
        return <ProjectsView onOpenProject={openProject} />;
      case "prompt-builder":
        return <PromptBuilderView />;
      case "models":
        return <ModelsView />;
      case "artifacts":
        return <ArtifactsView />;
      default:
        return <PlaceholderView label={PLACEHOLDER_LABEL[active] ?? "This section"} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0712] font-sans">
      <Sidebar active={active} activeChatId={openChatId} onNavigate={navigate} onOpenChat={openChat} />
      <main className="flex-1 overflow-hidden">{renderView()}</main>
    </div>
  );
}