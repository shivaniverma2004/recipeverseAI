"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Clock, Heart, LogOut, Camera } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import { toggleFollow } from "@/lib/actions/social";
import { useAuth } from "@/context/AuthContext";
import type { Recipe } from "@/types";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Stats {
  recipes_count: number;
  followers_count: number;
  following_count: number;
}

interface Props {
  profile: Profile;
  stats: Stats;
  recipes: Recipe[];
  isOwn: boolean;
  initialIsFollowing: boolean;
}

export default function ProfileClient({ profile, stats, recipes, isOwn, initialIsFollowing }: Props) {
  const router = useRouter();
  const { signOut } = useAuth();

  const [following, setFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(stats.followers_count);
  const [showMenu, setShowMenu] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const displayName = profile.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  async function handleLogout() {
    await signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  }

  async function handleFollow() {
    if (followLoading) return;
    setFollowLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount((p) => wasFollowing ? p - 1 : p + 1);
    try {
      await toggleFollow(profile.id);
    } catch {
      setFollowing(wasFollowing);
      setFollowerCount((p) => wasFollowing ? p + 1 : p - 1);
      toast.error("Failed to update follow");
    } finally {
      setFollowLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#F9FBFF]/90 backdrop-blur-sm">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
          <ChevronLeft size={22} className="text-[#192A56]" />
        </button>
        <span className="text-[15px] font-bold text-[#192A56]">@{profile.username}</span>
        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors"
          >
            <MoreHorizontal size={22} className="text-[#192A56]" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-[#E5E9F2] rounded-2xl shadow-xl overflow-hidden z-50 w-48">
              {isOwn && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="h-28 bg-gradient-to-r from-[#2EC4B6] to-[#28b0a3]" />

      {/* Avatar */}
      <div className="px-4">
        <div className="relative -mt-14 w-[88px] h-[88px]">
          <div className="w-[88px] h-[88px] rounded-full border-4 border-white overflow-hidden bg-[#E5E9F2] shadow-md">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} width={88} height={88} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#2EC4B6] flex items-center justify-center text-white text-3xl font-bold">
                {displayName[0]}
              </div>
            )}
          </div>
          {isOwn && (
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#2EC4B6] rounded-full flex items-center justify-center border-2 border-white shadow">
              <Camera size={13} className="text-white" />
            </button>
          )}
        </div>

        {/* Name + bio */}
        <div className="mt-3">
          <h1 className="text-[18px] font-bold text-[#192A56]">{displayName}</h1>
          <p className="text-sm text-[#5C677D]">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-[#5C677D] mt-2 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center mt-4 gap-6">
          {[
            { label: "Recipes",   value: stats.recipes_count },
            { label: "Followers", value: followerCount },
            { label: "Following", value: stats.following_count },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-[17px] font-bold text-[#192A56]">{value}</span>
              <span className="text-xs text-[#5C677D]">{label}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          {isOwn ? (
            <button onClick={() => router.push("/profile/edit")} className="flex-1 h-10 rounded-full bg-[#2EC4B6] text-white text-sm font-semibold hover:bg-[#28b0a3] transition-colors">
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 ${
                  following
                    ? "border-2 border-[#2EC4B6] text-[#2EC4B6]"
                    : "bg-[#2EC4B6] text-white hover:bg-[#28b0a3]"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Published Recipes grid */}
      <div className="px-4 mt-6 pb-24">
        <h2 className="text-[15px] font-bold text-[#192A56] mb-3">Published Recipes</h2>
        {recipes.length === 0 ? (
          <p className="text-center text-sm text-[#5C677D] py-8">No recipes published yet.</p>
        ) : (
          <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-5">
            {recipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[#E5E9F2]">
                  <div className="relative w-full aspect-square bg-[#E5E9F2]">
                    {recipe.cover_image_url ? (
                      <Image src={recipe.cover_image_url} alt={recipe.title} fill className="object-cover" sizes="33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍳</div>
                    )}
                  </div>
                  <div className="px-1.5 py-1.5">
                    <p className="text-[11px] sm:text-[12px] font-semibold text-[#192A56] line-clamp-1 leading-tight">{recipe.title}</p>
                    <div className="flex items-center gap-8 mt-1">
                      <div className="flex items-center gap-0.5 text-[#5C677D]">
                        <Clock size={9} />
                        <span className="text-[9px] sm:text-[10px] font-medium">{(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} min</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Heart size={9} className="fill-red-400 text-red-400" />
                        <span className="text-[9px] sm:text-[10px] font-semibold text-[#5C677D]">{recipe.likes_count ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
