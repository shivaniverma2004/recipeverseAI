"use client";

import Link from "next/link";
import { ChevronLeft, MoreHorizontal, User } from "lucide-react";

interface TopNavProps {
  title?: string;
  showBack?: boolean;
  showMore?: boolean;
  showProfile?: boolean;
  onBack?: () => void;
  onMore?: () => void;
}

export default function TopNav({
  title = "RecipeVerse AI",
  showBack = false,
  showMore = false,
  showProfile = false,
  onBack,
  onMore,
}: TopNavProps) {
  const isBrand = title === "RecipeVerse AI";

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[#F7F3E3] border-b border-[#E5E9F2]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
      {/* Left */}
      <div className="w-10 flex items-center">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors"
          >
            <ChevronLeft size={22} className="text-[#192A56]" />
          </button>
        ) : null}
      </div>

      {/* Center title */}
      {isBrand ? (
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="RecipeVerse" className="w-7 h-7" />
          <span className="font-bold text-base tracking-tight text-[#2EC4B6]">
            RecipeVerse <span className="text-[#FF9F1C]">AI</span>
          </span>
        </div>
      ) : (
        <span className="font-bold text-base tracking-tight text-[#192A56]">
          {title}
        </span>
      )}

      {/* Right */}
      <div className="w-10 flex items-center justify-end gap-2">
        {showMore && (
          <button
            onClick={onMore}
            className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors"
          >
            <MoreHorizontal size={22} className="text-[#192A56]" />
          </button>
        )}
        {showProfile && (
          <Link href="/profile/me" className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
            <User size={22} className="text-[#192A56]" />
          </Link>
        )}
      </div>
      </div>
    </header>
  );
}
