"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import AIAssistantPanel from "@/components/ai/AIAssistantPanel";

interface RecipeContext {
  title: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  cuisine: string;
}

interface Props {
  recipeContext?: RecipeContext;
}

export default function FloatingAI({ recipeContext }: Props) {
  const [showAI, setShowAI] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const hideOn = ["/ai-assistant", "/login", "/signup", "/forgot-password", "/reset-password", "/create"];
  if (hideOn.includes(pathname)) return null;
  if (/^\/recipe\/[^/]+\/edit$/.test(pathname)) return null;

  // Recipe detail page has its own FloatingAI with recipe context — don't render the generic one
  const isRecipeDetail = /^\/recipe\/[^/]+$/.test(pathname);
  if (!recipeContext && isRecipeDetail) return null;

  function handleClick() {
    if (isDesktop) {
      setShowAI((p) => !p);
    } else {
      if (recipeContext) {
        sessionStorage.setItem("ai_recipe_context", JSON.stringify(recipeContext));
      }
      router.push("/ai-assistant");
    }
  }

  return (
    <>
      {/* Mobile: fixed inside BottomNav area — shown as part of BottomNav row */}
      <button
        onClick={handleClick}
        className="lg:hidden fixed bottom-[72px] right-3 z-50 w-[44px] h-[44px] rounded-full bg-[#2EC4B6] shadow-[0_4px_16px_rgba(46,196,182,0.45)] flex items-center justify-center active:scale-95 transition-all"
      >
        <Sparkles size={20} className="text-white" />
      </button>

      {/* Desktop: fixed bottom-right */}
      <button
        onClick={handleClick}
        className="hidden lg:flex fixed bottom-10 right-10 xl:bottom-12 xl:right-12 2xl:bottom-16 2xl:right-16 z-50 w-[58px] h-[58px] xl:w-[64px] xl:h-[64px] rounded-full bg-[#2EC4B6] shadow-[0_4px_20px_rgba(46,196,182,0.45)] items-center justify-center hover:bg-[#28b0a3] active:scale-95 transition-all"
      >
        <Sparkles size={26} className="text-white" />
      </button>

      {showAI && isDesktop && (
        <AIAssistantPanel onClose={() => setShowAI(false)} recipeContext={recipeContext} desktop />
      )}
    </>
  );
}
