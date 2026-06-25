import { useState } from "react";
import ArtifactsLandingView from "./ArtifactsLandingView";
import ArtifactsWorkspaceView from "./ArtifactsWorkspaceView";

export default function ArtifactsView() {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  if (!activePrompt) {
    return <ArtifactsLandingView onCreate={setActivePrompt} />;
  }

  return <ArtifactsWorkspaceView initialPrompt={activePrompt} onBack={() => setActivePrompt(null)} />;
}