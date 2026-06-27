import { useCallback, useEffect, useState } from "react";
import { Construction } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar, {
  type NavKey,
  type RecentChat,
} from "./components/sidebar/Sidebar";
import NewChatView from "./pages/NewChatView";
import ChatsView from "./pages/ChatsView";
import ProjectsView from "./pages/ProjectsView";
import ProjectDetailView from "./pages/ProjectDetailView";
import ChatThreadView from "./pages/ChatThreadView";
import PromptBuilderView from "./pages/PromptBuilderView";
import ModelsView from "./pages/ModelsView";
import ArtifactsView from "./pages/ArtifactsView";
import KnowledgeBaseFeature from "./pages/KnowledgeBaseFeature";
import CompareView from "./pages/CompareView";

interface ChatSummary {
  id: string;
  title: string;
  model: string;
  created_at: string;
}

const PLACEHOLDER_LABEL: Record<string, string> = {
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

  // Set right after a chat is created from the New Chat composer (or Prompt
  // Builder hand-off) so ChatThreadView knows to auto-send it on mount.
  const [pendingFirstMessage, setPendingFirstMessage] = useState<string | null>(
    null,
  );
  // Prefills the New Chat composer, e.g. coming from Prompt Builder.
  const [prefillPrompt, setPrefillPrompt] = useState<string | undefined>(
    undefined,
  );

  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  const refreshChats = useCallback(async () => {
    try {
      const chats = await invoke<ChatSummary[]>("list_chats");
      setRecentChats(chats.map((c) => ({ id: c.id, title: c.title })));
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  }, []);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const navigate = (key: NavKey) => {
    setOpenChatId(null);
    setOpenProjectId(null);
    setPendingFirstMessage(null);
    if (key !== "new-chat") setPrefillPrompt(undefined);
    setActive(key);
  };

  const openChat = (chatId: string) => {
    setOpenProjectId(null);
    setPendingFirstMessage(null);
    setOpenChatId(chatId);
  };

  const openProject = (projectId: string) => {
    setOpenChatId(null);
    setOpenProjectId(projectId);
  };

  // New Chat composer created a chat row in SQLite — switch straight into the
  // thread view and let it auto-send the same first message to Ollama.
  const handleChatCreated = (chatId: string, firstMessage: string) => {
    setPrefillPrompt(undefined);
    setPendingFirstMessage(firstMessage);
    setOpenProjectId(null);
    setOpenChatId(chatId);
    refreshChats();
  };

  // Prompt Builder hands its generated prompt to a fresh New Chat composer.
  const handleUseInChat = (prompt: string) => {
    setOpenChatId(null);
    setOpenProjectId(null);
    setPrefillPrompt(prompt);
    setActive("new-chat");
  };

  const renderView = () => {
    if (openChatId) {
      return (
        <ChatThreadView
          key={openChatId}
          chatId={openChatId}
          initialMessage={pendingFirstMessage ?? undefined}
          onBack={() => {
            setOpenChatId(null);
            setPendingFirstMessage(null);
            refreshChats();
          }}
        />
      );
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
        return (
          <NewChatView
            onChatCreated={handleChatCreated}
            initialPrompt={prefillPrompt}
          />
        );
      case "chats":
        return <ChatsView onOpenChat={openChat} />;
      case "projects":
        return <ProjectsView onOpenProject={openProject} />;
      case "prompt-builder":
        return <PromptBuilderView onUseInChat={handleUseInChat} />;
      case "models":
        return <ModelsView />;
      case "artifacts":
        return <ArtifactsView />;
      case "knowledge-base":
        return <KnowledgeBaseFeature />;
      case "compare":
        return <CompareView />;
      default:
        return (
          <PlaceholderView
            label={PLACEHOLDER_LABEL[active] ?? "This section"}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0712] font-sans">
      <Sidebar
        active={active}
        activeChatId={openChatId}
        recentChats={recentChats}
        onNavigate={navigate}
        onOpenChat={openChat}
      />
      <main className="flex-1 overflow-hidden">{renderView()}</main>
    </div>
  );
}
