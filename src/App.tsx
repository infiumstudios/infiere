import { useState } from "react";
import { Construction } from "lucide-react";
import Sidebar, { type NavKey } from "./components/sidebar/Sidebar";
import NewChatView from "./pages/NewChatView";
import ChatsView from "./pages/ChatsView";
import ProjectsView from "./pages/ProjectsView";

const PLACEHOLDER_LABEL: Record<string, string> = {
  artifacts: "Artifacts",
  "knowledge-base": "Knowledge Base",
  compare: "Compare",
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

  const renderView = () => {
    switch (active) {
      case "new-chat":
        return <NewChatView />;
      case "chats":
        return <ChatsView />;
      case "projects":
        return <ProjectsView />;
      default:
        return <PlaceholderView label={PLACEHOLDER_LABEL[active] ?? "This section"} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0712] font-sans">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 overflow-hidden">{renderView()}</main>
    </div>
  );
}