import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Check,
} from "lucide-react";

export interface ChatFilters {
  dateRange: "today" | "7d" | "30d" | "custom" | null;
  customFrom?: string;
  customTo?: string;
  project: string | null;
  model: string | null;
  fileTypes: ("pdf" | "image" | "document")[];
  starredOnly: boolean;
}

const EMPTY_FILTERS: ChatFilters = {
  dateRange: null,
  project: null,
  model: null,
  fileTypes: [],
  starredOnly: false,
};

const DATE_OPTIONS: { value: ChatFilters["dateRange"]; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];

const PROJECT_OPTIONS = ["Image", "Presentation", "Rlaet"];
const MODEL_OPTIONS = ["Nexus AI v6.0", "Nexus AI v5.2", "Nexus Mini"];

const FILE_TYPE_OPTIONS: { value: "pdf" | "image" | "document"; label: string; icon: typeof FileText }[] = [
  { value: "pdf", label: "PDFs", icon: FileText },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "document", label: "Documents", icon: File },
];

function countActive(filters: ChatFilters): number {
  let n = 0;
  if (filters.dateRange) n += 1;
  if (filters.project) n += 1;
  if (filters.model) n += 1;
  if (filters.fileTypes.length) n += 1;
  if (filters.starredOnly) n += 1;
  return n;
}

interface ChatFilterBarProps {
  filters: ChatFilters;
  onChange: (filters: ChatFilters) => void;
}

export default function ChatFilterBar({ filters, onChange }: ChatFilterBarProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActive(filters);

  const toggleFileType = (type: "pdf" | "image" | "document") => {
    const next = filters.fileTypes.includes(type)
      ? filters.fileTypes.filter((t) => t !== type)
      : [...filters.fileTypes, type];
    onChange({ ...filters, fileTypes: next });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition ${
          activeCount > 0
            ? "border-violet-400/40 bg-violet-500/15 text-white"
            : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.07]"
        }`}
      >
        <SlidersHorizontal size={14} />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-violet-500 px-1 text-[11px] font-medium text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown size={13} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-[320px] rounded-2xl border border-white/10 bg-[#1a0f2e] p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]">
            {/* Date */}
            <div className="mb-4">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-white/35">Date</p>
              <div className="flex flex-wrap gap-1.5">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onChange({
                        ...filters,
                        dateRange: filters.dateRange === opt.value ? null : opt.value,
                      })
                    }
                    className={`rounded-full px-3 py-1.5 text-[12.5px] transition ${
                      filters.dateRange === opt.value
                        ? "bg-violet-500/25 text-white"
                        : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {filters.dateRange === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.customFrom ?? ""}
                    onChange={(e) => onChange({ ...filters, customFrom: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[12.5px] text-white/80 [color-scheme:dark]"
                  />
                  <span className="text-white/30">–</span>
                  <input
                    type="date"
                    value={filters.customTo ?? ""}
                    onChange={(e) => onChange({ ...filters, customTo: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[12.5px] text-white/80 [color-scheme:dark]"
                  />
                </div>
              )}
            </div>

            {/* Project */}
            <div className="mb-4">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-white/35">Project</p>
              <select
                value={filters.project ?? ""}
                onChange={(e) => onChange({ ...filters, project: e.target.value || null })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2 text-[13px] text-white/80 focus:outline-none"
              >
                <option value="">Any project</option>
                {PROJECT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="mb-4">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-white/35">Model</p>
              <select
                value={filters.model ?? ""}
                onChange={(e) => onChange({ ...filters, model: e.target.value || null })}
                className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-2 text-[13px] text-white/80 focus:outline-none"
              >
                <option value="">Any model</option>
                {MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Files */}
            <div className="mb-4">
              <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-white/35">Has files</p>
              <div className="flex flex-wrap gap-1.5">
                {FILE_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const isActive = filters.fileTypes.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleFileType(value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition ${
                        isActive ? "bg-violet-500/25 text-white" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09]"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                      {isActive && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starred */}
            <button
              onClick={() => onChange({ ...filters, starredOnly: !filters.starredOnly })}
              className={`mb-4 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition ${
                filters.starredOnly ? "bg-violet-500/15 text-white" : "bg-white/[0.04] text-white/65 hover:bg-white/[0.07]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Star size={14} className={filters.starredOnly ? "fill-amber-400 text-amber-400" : ""} />
                Starred only
              </span>
              {filters.starredOnly && <Check size={14} />}
            </button>

            <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
              <button
                onClick={() => onChange(EMPTY_FILTERS)}
                className="flex items-center gap-1 text-[12.5px] text-white/45 transition hover:text-white/75"
              >
                <X size={12} />
                Clear all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-violet-600 px-4 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-violet-500"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { EMPTY_FILTERS };