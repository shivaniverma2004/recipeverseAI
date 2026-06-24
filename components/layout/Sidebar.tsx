"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const navItems = [
  { href: "/home",       icon: Home,    label: "Home" },
  { href: "/explore",    icon: Compass, label: "Explore" },
  { href: "/create",     icon: PenLine, label: "Create" },
  { href: "/profile/me", icon: User,    label: "Profile" },
];

interface SidebarProfile {
  username: string;
  avatar_url: string | null;
  recipes_count: number;
  followers_count: number;
  following_count: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("username, avatar_url").eq("id", user.id).single(),
      supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
    ]).then(([profileRes, recipesRes, followersRes, followingRes]) => {
      if (profileRes.data) {
        setProfile({
          username: profileRes.data.username,
          avatar_url: profileRes.data.avatar_url,
          recipes_count: recipesRes.count ?? 0,
          followers_count: followersRes.count ?? 0,
          following_count: followingRes.count ?? 0,
        });
      }
    });
  }, [user]);

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  const displayName = profile?.username
    ? profile.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : user?.email?.split("@")[0] ?? "";

  const hideOn = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (hideOn.includes(pathname)) return null;

  return (
    <aside className="hidden lg:flex flex-col w-[240px] xl:w-[270px] 2xl:w-[300px] shrink-0 h-screen sticky top-0 border-r border-[#E5E9F2] bg-[#F7F3E3] px-4 xl:px-5 py-6">

      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2.5 px-2 mb-8">
        <img src="/icon.svg" alt="RecipeVerse" className="w-8 h-8" />
        <span className="font-bold text-lg tracking-tight text-[#2EC4B6]">
          RecipeVerse <span className="text-[#FF9F1C]">AI</span>
        </span>
      </Link>

      {/* Profile summary at top */}
      {profile && (
        <Link href="/profile/me" className="flex flex-col items-center px-2 mb-6 group">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#2EC4B6] flex items-center justify-center mb-2">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" sizes="64px" />
            ) : (
              <span className="text-white text-2xl font-bold">{displayName[0]?.toUpperCase()}</span>
            )}
          </div>
          <p className="text-[14px] font-bold text-[#192A56] group-hover:text-[#2EC4B6] transition-colors">{displayName}</p>
          <p className="text-[11px] text-[#5C677D]">@{profile.username}</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 w-full justify-center">
            {[
              { label: "Posts",     value: profile.recipes_count },
              { label: "Followers", value: profile.followers_count },
              { label: "Following", value: profile.following_count },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-[14px] font-bold text-[#192A56]">{value}</span>
                <span className="text-[10px] text-[#5C677D]">{label}</span>
              </div>
            ))}
          </div>
        </Link>
      )}

      <div className="h-px bg-[#E5E9F2] mb-4" />

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                active
                  ? "bg-[#2EC4B6] text-white shadow-sm"
                  : "text-[#5C677D] hover:bg-[#E5E9F2]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {user && (
        <div className="mt-4 border-t border-[#E5E9F2] pt-4">
          <button
            onClick={async () => { setLoggingOut(true); await signOut(); }}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl text-[14px] font-semibold text-[#5C677D] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </aside>
  );
}
