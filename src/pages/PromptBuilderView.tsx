import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, RotateCcw } from "lucide-react";

const TASK_EXAMPLES = ["Write a blog post", "Debug code", "Summarize a PDF", "Create SQL queries", "Generate UI design"];
const PERSONA_OPTIONS = [
  "Senior software engineer",
  "Data scientist",
  "UI/UX designer",
  "Professor",
  "Technical writer",
  "Startup founder",
];
const FORMAT_OPTIONS = ["Step-by-step guide", "Table", "Code only", "JSON", "Markdown document", "Presentation slides"];
const AUDIENCE_OPTIONS = ["Beginner", "Intermediate", "Expert", "Children", "Executives"];
const TONE_OPTIONS = ["Professional", "Friendly", "Technical", "Persuasive", "Academic"];
const DEPTH_OPTIONS = ["Quick answer", "Detailed analysis", "Expert-level breakdown"];
const EXTRA_OPTIONS = ["Include examples", "Include edge cases", "Include best practices"];

interface FormState {
  task: string;
  persona: string;
  context: string;
  constraints: string;
  format: string;
  audience: string;
  tone: string;
  depth: string;
  extras: string[];
}

const EMPTY_FORM: FormState = {
  task: "",
  persona: "",
  context: "",
  constraints: "",
  format: "",
  audience: "",
  tone: "",
  depth: "",
  extras: [],
};

const EMPTY_PROMPT_PLACEHOLDER = "Fill in the fields to generate your prompt.";

function buildPrompt(form: FormState): string {
  const lines: string[] = [];
  if (form.persona) lines.push(`You are acting as a ${form.persona.toLowerCase()}.`);
  if (form.task) lines.push(`Task: ${form.task}`);
  if (form.context) lines.push(`\nContext:\n${form.context}`);
  if (form.constraints) lines.push(`\nConstraints:\n${form.constraints}`);
  if (form.format) lines.push(`\nOutput format: ${form.format}.`);
  if (form.audience) lines.push(`Target audience: ${form.audience}.`);
  if (form.tone) lines.push(`Tone: ${form.tone}.`);
  if (form.depth) lines.push(`Reasoning depth: ${form.depth}.`);
  if (form.extras.length) lines.push(`\nAdditionally: ${form.extras.join(", ").toLowerCase()}.`);
  return lines.join("\n") || EMPTY_PROMPT_PLACEHOLDER;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-[13px] font-medium text-white/80">{label}</label>
      {hint && <p className="mb-2 text-[12px] text-white/35">{hint}</p>}
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`rounded-full px-3 py-1.5 text-[12.5px] transition ${
            value === opt ? "bg-violet-500/25 text-white" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const textareaClass =
  "w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-white/85 placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none";

interface PromptBuilderViewProps {
  /** Hands the final prompt text to a fresh chat (switches to New Chat, prefilled). */
  onUseInChat?: (prompt: string) => void;
}

export default function PromptBuilderView({ onUseInChat }: PromptBuilderViewProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);

  const generatedPrompt = useMemo(() => buildPrompt(form), [form]);
  const prompt = editedPrompt ?? generatedPrompt;

  const toggleExtra = (extra: string) => {
    setForm((f) => ({
      ...f,
      extras: f.extras.includes(extra) ? f.extras.filter((e) => e !== extra) : [...f.extras, extra],
    }));
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-[#150a24]">
      <div className="border-b border-white/[0.06] px-8 py-5">
        <h1 className="font-serif text-[22px] text-white/90">Prompt builder</h1>
        <p className="text-[12.5px] text-white/40">Answer a few questions, get a structured prompt to copy and edit.</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <Field label="What should the AI do?" hint="e.g. Write a blog post, debug code, summarize a PDF">
            <textarea
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
              placeholder={TASK_EXAMPLES.join(" · ")}
              rows={2}
              className={textareaClass}
            />
          </Field>

          <Field label="AI role / persona" hint="Who should the AI act as?">
            <ChipGroup options={PERSONA_OPTIONS} value={form.persona} onChange={(v) => setForm({ ...form, persona: v })} />
          </Field>

          <Field
            label="Context / background"
            hint="Project description, existing code, business requirements, target users, previous attempts"
          >
            <textarea
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
              placeholder="Paste or describe the background the AI needs…"
              rows={4}
              className={textareaClass}
            />
          </Field>

          <Field label="Constraints" hint="Word limit, language, framework, budget, deadline, reading level">
            <textarea
              value={form.constraints}
              onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              placeholder="e.g. under 500 words, written in TypeScript, due by Friday"
              rows={2}
              className={textareaClass}
            />
          </Field>

          <Field label="Desired output format">
            <ChipGroup options={FORMAT_OPTIONS} value={form.format} onChange={(v) => setForm({ ...form, format: v })} />
          </Field>

          <Field label="Target audience">
            <ChipGroup options={AUDIENCE_OPTIONS} value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} />
          </Field>

          <Field label="Tone">
            <ChipGroup options={TONE_OPTIONS} value={form.tone} onChange={(v) => setForm({ ...form, tone: v })} />
          </Field>

          <Field label="Reasoning depth">
            <ChipGroup options={DEPTH_OPTIONS} value={form.depth} onChange={(v) => setForm({ ...form, depth: v })} />
          </Field>

          <Field label="Examples">
            <div className="flex flex-wrap gap-1.5">
              {EXTRA_OPTIONS.map((opt) => {
                const isActive = form.extras.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleExtra(opt)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] transition ${
                      isActive ? "bg-violet-500/25 text-white" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09]"
                    }`}
                  >
                    {opt}
                    {isActive && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </Field>

          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setEditedPrompt(null);
            }}
            className="flex items-center gap-1.5 text-[12.5px] text-white/40 transition hover:text-white/70"
          >
            <RotateCcw size={12} />
            Reset form
          </button>
        </div>

        {/* generated prompt panel */}
        <aside className="flex w-[380px] shrink-0 flex-col border-l border-white/[0.06] px-5 py-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-white/80">
              <Sparkles size={14} className="text-violet-300" />
              Generated prompt
            </p>
            <div className="flex items-center gap-2">
              {editedPrompt !== null && (
                <button
                  onClick={() => setEditedPrompt(null)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/55 transition hover:bg-white/[0.08]"
                >
                  <RotateCcw size={12} />
                  Regenerate
                </button>
              )}
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/65 transition hover:bg-white/[0.08]"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Your structured prompt appears here as you fill in the form. Edit it freely before copying."
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-relaxed text-white/85 placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
          />
          {onUseInChat && (
            <button
              onClick={() => onUseInChat(prompt)}
              disabled={!prompt.trim() || prompt === EMPTY_PROMPT_PLACEHOLDER}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-[13px] font-medium text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] transition hover:bg-violet-500 disabled:opacity-40 disabled:shadow-none"
            >
              <Sparkles size={14} />
              Use in new chat
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}