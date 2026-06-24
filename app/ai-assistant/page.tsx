"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, Send, X, ChefHat } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface GeminiMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

interface RecipeContext {
  title: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  cuisine: string;
}

const QUICK_PROMPTS = [
  "How do I scale a recipe for more servings?",
  "What are common substitutes for butter?",
  "How to perfectly boil pasta?",
  "What spices go well with chicken?",
];

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipeContext, setRecipeContext] = useState<RecipeContext | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("ai_recipe_context");
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return null;
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Clear context from sessionStorage now that we've read it in useState initializer
    sessionStorage.removeItem("ai_recipe_context");

    // Load prefill question and send it
    const prefill = sessionStorage.getItem("ai_prefill");
    if (prefill) {
      sessionStorage.removeItem("ai_prefill");
      // Use functional read of recipeContext since state is already initialized
      setRecipeContext((ctx) => {
        sendWithContext(prefill, ctx);
        return ctx;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildContextPrefix(ctx: RecipeContext): string {
    return `You are helping with this specific recipe:
Title: "${ctx.title}"
Cuisine: ${ctx.cuisine}
Servings: ${ctx.servings}
Ingredients: ${ctx.ingredients.join(", ")}
Steps: ${ctx.steps.map((s, i) => `${i + 1}. ${s}`).join(" ")}

`;
  }

  function buildGeminiHistory(msgs: Message[], ctx: RecipeContext | null): GeminiMessage[] {
    return msgs.map((m, i) => {
      // Silently prepend recipe context to the very first user message for the API
      const isFirstUser = m.role === "user" && i === 0 && ctx;
      return {
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: isFirstUser ? `${buildContextPrefix(ctx)}${m.text}` : m.text }],
      };
    });
  }

  async function sendWithContext(userText: string, ctx: RecipeContext | null) {
    if (!userText || loading) return;
    setInput("");
    setError(null);

    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildGeminiHistory(newMessages, ctx) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get response");
      setMessages((p) => [...p, { role: "ai", text: data.text }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    await sendWithContext(userText, recipeContext);
  }

  return (
    <div className="flex flex-col h-screen bg-[#F9FBFF]">
      {/* Header */}
      <div className="flex items-center gap-3 h-14 px-4 bg-[#F7F3E3] border-b border-[#E5E9F2] shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
          <ChevronLeft size={22} className="text-[#192A56]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#FF9F1C]/10 flex items-center justify-center">
          <Sparkles size={16} className="text-[#FF9F1C]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#192A56] leading-tight">AI Assistant</p>
          <p className="text-[10px] text-[#2EC4B6] font-medium">Powered by Gemini</p>
        </div>
      </div>

      {/* Recipe context banner */}
      {recipeContext && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-[#2EC4B6]/10 border-b border-[#2EC4B6]/20">
          <div className="w-8 h-8 rounded-full bg-[#2EC4B6]/20 flex items-center justify-center shrink-0">
            <ChefHat size={15} className="text-[#2EC4B6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#2EC4B6] uppercase tracking-wide">Chatting about</p>
            <p className="text-[13px] font-bold text-[#192A56] truncate">{recipeContext.title}</p>
          </div>
          <button
            onClick={() => setRecipeContext(null)}
            className="shrink-0 w-6 h-6 rounded-full bg-[#2EC4B6]/20 flex items-center justify-center text-[#2EC4B6] hover:bg-[#2EC4B6]/30 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-2" style={{ scrollbarWidth: "none" }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center gap-3 pb-4">
            <div className="w-16 h-16 rounded-full bg-[#FF9F1C]/10 flex items-center justify-center">
              <Sparkles size={32} className="text-[#FF9F1C]" />
            </div>
            <p className="text-sm font-semibold text-[#192A56]">Hi! I&apos;m your AI cooking assistant.</p>
            <p className="text-xs text-[#5C677D] max-w-xs leading-relaxed">
              {recipeContext
                ? `Ask me anything about "${recipeContext.title}" — scale servings, substitute ingredients, or cooking tips.`
                : "Ask me to scale recipes, suggest ingredient substitutions, or answer any cooking questions."}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              {(recipeContext ? [
                `How do I scale "${recipeContext.title}" for more servings?`,
                `What can I substitute in "${recipeContext.title}"?`,
                `Any tips for making "${recipeContext.title}" better?`,
                `How long can I store "${recipeContext.title}"?`,
              ] : QUICK_PROMPTS).map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs text-left bg-[#F7F3E3] border border-[#E5E9F2] rounded-xl px-4 py-2.5 text-[#5C677D] hover:border-[#2EC4B6] hover:text-[#192A56] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-full bg-[#FF9F1C]/10 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles size={14} className="text-[#FF9F1C]" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#FF9F1C] text-white rounded-br-sm"
                  : "bg-[#F7F3E3] text-[#192A56] rounded-bl-sm border border-[#E5E9F2]"
              }`}
            >
              {msg.role === "user" ? (
                <span>{msg.text}</span>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-[#192A56]">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-2">
                        <table className="w-full text-xs border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="bg-[#2EC4B6]/10 text-[#192A56] font-semibold px-3 py-1.5 border border-[#E5E9F2] text-left">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-1.5 border border-[#E5E9F2]">{children}</td>,
                    h1: ({ children }) => <h1 className="text-base font-bold text-[#192A56] mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold text-[#192A56] mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold text-[#192A56] mb-1">{children}</h3>,
                    code: ({ children }) => <code className="bg-[#E5E9F2] rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#FF9F1C]/10 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Sparkles size={14} className="text-[#FF9F1C]" />
            </div>
            <div className="bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#5C677D] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2 inline-block">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-[#F7F3E3] border-t border-[#E5E9F2] mb-16">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={recipeContext ? `Ask about "${recipeContext.title}"...` : "Ask anything about cooking..."}
          className="flex-1 bg-white border border-[#E5E9F2] rounded-full px-4 py-2.5 text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none focus:border-[#2EC4B6] transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#2EC4B6] flex items-center justify-center shrink-0 hover:bg-[#28b0a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
