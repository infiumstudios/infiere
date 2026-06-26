import { useState } from "react";
import KnowledgeBaseView from "./KnowledgeBaseView";
import CollectionDetailView from "./CollectionDetailView";

export default function KnowledgeBaseFeature() {
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);

  if (openCollectionId) {
    return <CollectionDetailView collectionId={openCollectionId} onBack={() => setOpenCollectionId(null)} />;
  }

  return <KnowledgeBaseView onOpenCollection={setOpenCollectionId} />;
}