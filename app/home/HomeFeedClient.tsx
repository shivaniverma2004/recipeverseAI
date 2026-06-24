"use client";

import Link from "next/link";
import RecipeCard from "@/components/recipe/RecipeCard";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import type { Recipe } from "@/types";

export default function HomeFeedClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">
      <TopNav title="RecipeVerse AI" showProfile />

      <main className="flex-1 pb-24 px-4 xl:px-6 pt-4 w-full max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4 py-3 border-b border-[#E5E9F2]">
          <h2 className="text-[18px] sm:text-[22px] xl:text-[24px] 2xl:text-[26px] font-extrabold text-[#192A56]">Your Feed</h2>
          <span className="text-xs font-semibold text-[#5C677D] bg-white border border-[#E5E9F2] px-3 py-1 rounded-full">Latest</span>
        </div>

        {initialRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-5xl">👨‍🍳</p>
            <p className="text-[15px] font-semibold text-[#192A56]">Your feed is empty</p>
            <p className="text-[13px] text-[#5C677D]">Follow some chefs to see their recipes here</p>
            <Link href="/explore" className="mt-2 px-5 py-2 bg-[#2EC4B6] text-white text-sm font-semibold rounded-full">
              Explore Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {initialRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
