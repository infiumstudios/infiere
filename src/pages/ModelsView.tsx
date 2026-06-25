import { useState } from "react";
import DiscoverModelsView from "./DiscoverModelsView";
import InstalledModelsView from "./InstalledModelsView";
import CloudProvidersView from "./CloudProvidersView";

type ModelsTab = "discover" | "installed" | "cloud";

const TABS: { key: ModelsTab; label: string }[] = [
  { key: "discover", label: "Discover" },
  { key: "installed", label: "Installed" },
  { key: "cloud", label: "Cloud Provider" },
];

export default function ModelsView() {
  const [tab, setTab] = useState<ModelsTab>("discover");

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <h1 className="mb-4 font-serif text-[22px] text-white/90">Models</h1>
        <div className="flex w-fit gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                tab === t.key
                  ? "bg-violet-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "discover" && <DiscoverModelsView />}
        {tab === "installed" && <InstalledModelsView />}
        {tab === "cloud" && <CloudProvidersView />}
      </div>
    </div>
  );
}