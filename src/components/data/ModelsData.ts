export interface ModelEntry {
  id: string;
  name: string;
  publisher: string;
  task: string;
  quant?: string;
  ram?: string;
  context?: string;
  dotColor: string;
  installed: boolean;
}

export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: "1",
    name: "zai-org/GLM-5.2",
    publisher: "zai-org",
    task: "Text Generation",
    quant: "GGUF",
    ram: "8GB",
    context: "128K",
    dotColor: "bg-emerald-400",
    installed: true,
  },
  {
    id: "2",
    name: "baidu/Unlimited-OCR",
    publisher: "baidu",
    task: "Image-Text-to-Text",
    dotColor: "bg-sky-400",
    installed: true,
  },
  {
    id: "3",
    name: "yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF",
    publisher: "yuxinlu1",
    task: "Text Generation",
    dotColor: "bg-lime-400",
    installed: true,
  },
  {
    id: "4",
    name: "yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF",
    publisher: "yuxinlu1",
    task: "Text Generation",
    dotColor: "bg-lime-400",
    installed: true,
  },
  {
    id: "5",
    name: "empero-ai/Qwythos-9B-Claude-Mythos-5-1M-GGUF",
    publisher: "empero-ai",
    task: "Text Generation",
    dotColor: "bg-violet-400",
    installed: false,
  },
];