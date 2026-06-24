"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Heart, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import FloatingAI from "@/components/layout/FloatingAI";
import { toggleLike, deleteRecipe } from "@/lib/actions/recipes";
import type { Recipe } from "@/types";

interface Props {
  recipe: Recipe & { author?: { id: string; username: string; avatar_url: string | null } };
  isOwner: boolean;
}

export default function RecipeDetailClient({ recipe, isOwner }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(recipe.is_liked ?? false);
  const [likes, setLikes] = useState(recipe.likes_count ?? 0);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  const authorName = recipe.author
    ? recipe.author.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const cuisineList = Array.isArray(recipe.cuisine) ? recipe.cuisine : recipe.cuisine ? [recipe.cuisine] : [];
  const cuisineDisplay = cuisineList.join(", ");

  const meta = [
    { label: "Prep Time", value: `${recipe.prep_time} min` },
    { label: "Cook Time", value: `${recipe.cook_time} min` },
    { label: "Servings",  value: String(recipe.servings) },
    { label: "Difficulty", value: recipe.difficulty },
  ];

  async function handleLike() {
    setLiked((p) => !p);
    setLikes((p) => liked ? p - 1 : p + 1);
    try {
      await toggleLike(recipe.id);
    } catch {
      setLiked((p) => !p);
      setLikes((p) => liked ? p + 1 : p - 1);
      toast.error("Failed to update like");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      toast.success("Recipe deleted");
      router.push("/home");
    } catch {
      toast.error("Failed to delete recipe");
      setDeleting(false);
    }
  }

  const displayIngredients = showAllIngredients
    ? recipe.ingredients
    : recipe.ingredients.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F9FBFF]">
      <div className="w-full max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#F9FBFF]/90 backdrop-blur-sm">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
            <ChevronLeft size={22} className="text-[#192A56]" />
          </button>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu((p) => !p)} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
                <MoreHorizontal size={22} className="text-[#192A56]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-[#E5E9F2] rounded-2xl shadow-xl overflow-hidden z-50 w-40">
                  <Link
                    href={`/recipe/${recipe.id}/edit`}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-[#192A56] hover:bg-[#F7F3E3] transition-colors"
                  >
                    <Pencil size={14} /> Edit Recipe
                  </Link>
                  <div className="h-px bg-[#E5E9F2]" />
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: stacked, Desktop: side by side */}
        <div className="flex flex-col lg:flex-row flex-1">

          {/* Cover image */}
          <div className="relative w-full lg:w-[380px] xl:w-[440px] 2xl:w-[500px] lg:shrink-0 h-[260px] lg:h-auto bg-[#E5E9F2] rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px] overflow-hidden lg:sticky lg:top-14 lg:self-start lg:min-h-[400px] xl:min-h-[500px]">
            {recipe.cover_image_url ? (
              <Image src={recipe.cover_image_url} alt={recipe.title} fill className="object-cover" sizes="512px" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🍳</div>
            )}
          </div>

        {/* Content */}
        <div className="flex-1 pb-28 px-4 lg:px-8 xl:px-10 2xl:px-12 pt-5 space-y-4">

          {/* Title + like */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[22px] xl:text-[26px] 2xl:text-[30px] font-extrabold text-[#192A56] leading-snug flex-1">{recipe.title}</h1>
            <button onClick={handleLike} className="flex items-center gap-1.5 shrink-0 mt-1 p-1">
              <Heart size={24} className={liked ? "fill-red-500 text-red-500" : "text-[#5C677D]"} />
              <span className={`text-[15px] font-bold ${liked ? "text-red-500" : "text-[#5C677D]"}`}>{likes}</span>
            </button>
          </div>

          {/* Author */}
          {recipe.author && (
            <Link href={`/profile/${recipe.user_id}`} className="flex items-center gap-2 w-fit group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#2EC4B6]">
                {recipe.author.avatar_url ? (
                  <Image src={recipe.author.avatar_url} alt={authorName} fill className="object-cover" sizes="32px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {authorName[0]}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-[#5C677D] group-hover:text-[#2EC4B6] transition-colors">
                by {authorName}
              </span>
            </Link>
          )}

          {/* Meta pills grid */}
          <div className="grid grid-cols-4 gap-2">
            {meta.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center bg-white border border-[#E5E9F2] rounded-2xl px-2 py-2.5 shadow-sm">
                <span className="text-[9px] sm:text-[10px] text-[#5C677D] font-medium whitespace-nowrap">{label}</span>
                <span className="text-[12px] sm:text-[13px] font-bold text-[#192A56] mt-0.5 whitespace-nowrap">{value}</span>
              </div>
            ))}
          </div>

          {/* Cuisine tags */}
          {cuisineList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cuisineList.map((c) => (
                <span key={c} className="flex items-center px-3 py-1.5 bg-[#E8FAF8] text-[#2EC4B6] text-xs font-semibold rounded-full border border-[#2EC4B6]/20">
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {recipe.description && (
            <div>
              <h2 className="text-[15px] font-bold text-[#192A56] mb-1.5">Description</h2>
              <p className="text-sm text-[#5C677D] leading-relaxed">{recipe.description}</p>
            </div>
          )}

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 bg-[#2EC4B6]/10 text-[#2EC4B6] rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h2 className="text-[15px] font-bold text-[#192A56] mb-2">Ingredients</h2>
            <ul className="space-y-2">
              {displayIngredients.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#5C677D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            {recipe.ingredients.length > 4 && (
              <button
                onClick={() => setShowAllIngredients((p) => !p)}
                className="mt-2 text-sm font-semibold text-[#2EC4B6]"
              >
                {showAllIngredients ? "See less ↑" : `See more ↓ (${recipe.ingredients.length - 4} more)`}
              </button>
            )}
          </div>

          {/* Steps */}
          <div>
            <h2 className="text-[15px] font-bold text-[#192A56] mb-3">Preparation Steps</h2>
            <ol className="space-y-4">
              {recipe.preparation_steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#2EC4B6] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#5C677D] leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

        </div>
        </div>{/* end flex row */}

        <FloatingAI recipeContext={{
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.preparation_steps,
          servings: recipe.servings,
          cuisine: cuisineDisplay,
        }} />
        <BottomNav />
      </div>
    </div>
  );
}
