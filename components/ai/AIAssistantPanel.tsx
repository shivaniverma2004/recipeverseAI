"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Send } from "lucide-react";

const quickPrompts = [
  "Scale this recipe for 4 servings",
  "Suggest substitutes for the ingredients",
  "How long can I store leftovers?",
];

const generalPrompts = [
  "How do I scale a recipe for more servings?",
  "What are common ingredient substitutes?",
  "How long can I store leftovers?",
];

interface RecipeContext {
  title: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  cuisine: string;
}

interface Props {
  onClose: () => void;
  recipeContext?: RecipeContext;
  desktop?: boolean;
}

export default function AIAssistantPanel({ onClose, recipeContext, desktop }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");

  function goToAI(text?: string) {
    const prompt = text ?? input.trim();
    if (!prompt) return;
    // Store user question and recipe context separately
    sessionStorage.setItem("ai_prefill", prompt);
    if (recipeContext) {
      sessionStorage.setItem("ai_recipe_context", JSON.stringify(recipeContext));
    }
    onClose();
    router.push("/ai-assistant");
  }

  const positionCls = desktop
    ? "fixed bottom-[76px] right-8 w-[360px] z-50"
    : "fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4";

  return (
    <div className={positionCls}>
      <div className="w-full bg-white rounded-3xl shadow-[0_-4px_32px_rgba(0,0,0,0.12)] border border-[#E5E9F2] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2EC4B6]/10 flex items-center justify-center">
              <Sparkles size={14} className="text-[#2EC4B6]" />
            </div>
            <span className="text-[14px] font-semibold text-[#192A56]">AI Cooking Assistant</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#F7F3E3] flex items-center justify-center text-[#5C677D] hover:text-[#192A56] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Context badge */}
        {recipeContext && (
          <div className="px-4 pb-2">
            <span className="text-[11px] bg-[#2EC4B6]/10 text-[#2EC4B6] font-medium px-3 py-1 rounded-full">
              Recipe: {recipeContext.title}
            </span>
          </div>
        )}

        {/* Welcome */}
        <div className="px-4 pb-3">
          <p className="text-[12px] text-[#5C677D] leading-relaxed">
            {recipeContext
              ? `Ask me anything about "${recipeContext.title}" — scale servings, substitute ingredients, or cooking tips.`
              : "Ask me about recipes, ingredient substitutions, scaling, or any cooking questions."}
          </p>
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-3 flex flex-col gap-2">
          {(recipeContext ? quickPrompts : generalPrompts).map((p) => (
            <button
              key={p}
              onClick={() => goToAI(p)}
              className="flex items-center gap-2.5 w-full text-left text-[12px] text-[#5C677D] bg-[#F7F3E3] border border-[#E5E9F2] rounded-xl px-3 py-2.5 hover:border-[#2EC4B6] transition-colors"
            >
              <span className="text-[#2EC4B6] text-base leading-none">✦</span>
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E5E9F2]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) goToAI(); }}
            placeholder="Ask anything..."
            className="flex-1 text-[13px] bg-[#F7F3E3] border border-[#E5E9F2] rounded-full px-4 py-2.5 outline-none text-[#192A56] placeholder:text-[#5C677D] focus:border-[#2EC4B6] transition-colors"
          />
          <button
            onClick={() => goToAI()}
            className="w-10 h-10 rounded-full bg-[#2EC4B6] flex items-center justify-center shrink-0 hover:bg-[#28b0a3] active:scale-95 transition-all"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
