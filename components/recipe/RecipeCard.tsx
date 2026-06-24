"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { toggleLike } from "@/lib/actions/recipes";
import type { Recipe } from "@/types";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [liked, setLiked] = useState(recipe.is_liked ?? false);
  const [likes, setLikes] = useState(recipe.likes_count ?? 0);

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((p) => wasLiked ? p - 1 : p + 1);
    try {
      await toggleLike(recipe.id);
    } catch {
      setLiked(wasLiked);
      setLikes((p) => wasLiked ? p + 1 : p - 1);
      toast.error("Failed to update like");
    }
  }

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0);
  const authorName = recipe.author
    ? recipe.author.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  return (
    <div onClick={() => router.push(`/recipe/${recipe.id}`)} className="cursor-pointer">
      <div className="flex h-[110px] sm:h-[120px] lg:h-[130px] xl:h-[140px] 2xl:h-[150px] bg-white rounded-2xl border border-[#E5E9F2] shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-transform gap-2.5 pl-1.5 pr-2 py-1.5">

        {/* Image */}
        <div className="relative w-[90px] sm:w-[110px] lg:w-[125px] xl:w-[140px] 2xl:w-[155px] shrink-0 bg-[#E5E9F2] rounded-xl overflow-hidden self-stretch">
          {recipe.cover_image_url ? (
            <Image src={recipe.cover_image_url} alt={recipe.title} fill className="object-cover" sizes="(max-width: 640px) 90px, 110px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍳</div>
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col justify-between min-w-0 px-1 pt-0.5 pb-1 overflow-hidden">

          {/* Title */}
          <h3 className="text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] font-extrabold text-[#192A56] leading-snug line-clamp-1">
            {recipe.title}
          </h3>

          {/* Author */}
          {recipe.author && (
            <Link
              href={`/profile/${recipe.user_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 w-fit"
            >
              <div className="relative w-[18px] h-[18px] rounded-full overflow-hidden bg-[#2EC4B6] shrink-0 flex items-center justify-center text-white text-[8px] font-bold">
                {recipe.author.avatar_url ? (
                  <Image src={recipe.author.avatar_url} alt={authorName} fill className="object-cover" sizes="18px" />
                ) : (
                  authorName[0]
                )}
              </div>
              <span className="text-[12px] font-semibold text-[#5C677D] truncate max-w-[120px] lg:max-w-[160px] xl:max-w-[200px]">by {authorName}</span>
            </Link>
          )}

          {/* Cuisine tags — max 2, no wrap */}
          {recipe.cuisine?.length > 0 && (
            <div className="flex gap-1 overflow-hidden">
              {(Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine]).slice(0, 2).map((c) => (
                <span key={c} className="text-[10px] font-semibold text-[#2EC4B6] bg-[#E8FAF8] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  {c}
                </span>
              ))}
              {(Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine]).length > 2 && (
                <span className="text-[10px] font-semibold text-[#5C677D] px-1 py-0.5 whitespace-nowrap shrink-0">
                  +{(Array.isArray(recipe.cuisine) ? recipe.cuisine : [recipe.cuisine]).length - 2}
                </span>
              )}
            </div>
          )}

          {/* Time + like row */}
          <div className="flex items-center justify-between pr-2">
            <div className="flex items-center gap-1 text-[#5C677D]">
              <Clock size={12} strokeWidth={2} />
              <span className="text-[12px] font-semibold">{totalTime} min</span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1 active:scale-90 transition-transform"
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                className={liked ? "fill-red-500 text-red-500" : "text-[#5C677D]"}
              />
              <span className="text-[13px] font-bold text-[#5C677D]">{likes}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
