"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2, ChevronDown, Check } from "lucide-react";
import RecipeCard from "@/components/recipe/RecipeCard";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import { searchRecipes, searchUsers } from "@/lib/actions/explore";
import type { Recipe } from "@/types";

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Props {
  initialRecipes: Recipe[];
  cuisines: string[];
  difficulties: string[];
}

const COOK_TIME_OPTIONS = [
  { label: "Any time", value: 0 },
  { label: "≤ 15 min", value: 15 },
  { label: "≤ 30 min", value: 30 },
  { label: "≤ 60 min", value: 60 },
];

export default function ExploreClient({ initialRecipes, cuisines, difficulties }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("All");
  const [maxCookTime, setMaxCookTime] = useState(0);

  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [users, setUsers] = useState<UserResult[]>([]);

  const [isPending, startTransition] = useTransition();
  const [userPending, setUserPending] = useState(false);

  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState("");
  const cuisineRef = useRef<HTMLDivElement>(null);

  const recipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close cuisine dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cuisineRef.current && !cuisineRef.current.contains(e.target as Node)) {
        setCuisineOpen(false);
        setCuisineSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (recipeTimer.current) clearTimeout(recipeTimer.current);
    recipeTimer.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchRecipes({ recipeQuery: query, cuisines: selectedCuisines, difficulty, maxCookTime });
        setRecipes(results);
      });
    }, 350);
    return () => { if (recipeTimer.current) clearTimeout(recipeTimer.current); };
  }, [query, selectedCuisines, difficulty, maxCookTime]);

  useEffect(() => {
    if (userTimer.current) clearTimeout(userTimer.current);
    if (query.trim().length < 2) { setUsers([]); return; }
    setUserPending(true);
    userTimer.current = setTimeout(async () => {
      const results = await searchUsers(query);
      setUsers(results);
      setUserPending(false);
    }, 350);
    return () => { if (userTimer.current) clearTimeout(userTimer.current); };
  }, [query]);

  function toggleCuisine(c: string) {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function removeCuisine(c: string) {
    setSelectedCuisines((prev) => prev.filter((x) => x !== c));
  }

  function clearAll() {
    setQuery("");
    setSelectedCuisines([]);
    setDifficulty("All");
    setMaxCookTime(0);
    setUsers([]);
  }

  const hasActiveFilters = query || selectedCuisines.length > 0 || difficulty !== "All" || maxCookTime > 0;
  const filteredCuisineOptions = cuisines.filter(
    (c) => c !== "All" && c.toLowerCase().includes(cuisineSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">
      <TopNav title="Explore" showProfile />

      <main className="flex-1 pb-24 px-4 xl:px-6 py-4 space-y-4 w-full max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">

        {/* Page heading */}
        <div className="flex items-center justify-between py-3 border-b border-[#E5E9F2]">
          <h2 className="text-[18px] sm:text-[22px] xl:text-[24px] 2xl:text-[26px] font-extrabold text-[#192A56]">Explore</h2>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs font-semibold text-[#2EC4B6] bg-[#E8FAF8] px-3 py-1 rounded-full">Clear filters</button>
          )}
        </div>

        {/* Single search bar */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E9F2] rounded-2xl px-4 h-12 shadow-sm">
          <Search size={17} className="text-[#5C677D] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes or users..."
            className="flex-1 bg-transparent text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none"
          />
          {(userPending || isPending)
            ? <Loader2 size={15} className="text-[#2EC4B6] animate-spin shrink-0" />
            : query && <button onClick={clearAll}><X size={15} className="text-[#5C677D]" /></button>
          }
        </div>

        {/* Filters */}
        <div className="space-y-2">
          {/* Cuisine searchable multi-select */}
          <div>
            <p className="text-[11px] font-semibold text-[#5C677D] mb-1.5 uppercase tracking-wide">Cuisine</p>
            <div ref={cuisineRef} className="relative">
              {/* Selected tags — always visible above trigger */}
              {selectedCuisines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedCuisines.map((c) => (
                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-[#2EC4B6] text-white text-xs font-semibold rounded-full">
                      {c}
                      <button onClick={(e) => { e.stopPropagation(); removeCuisine(c); }}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}

              {/* Trigger button */}
              <button
                onClick={() => { setCuisineOpen(!cuisineOpen); setCuisineSearch(""); }}
                className="w-full flex items-center justify-between px-4 h-11 rounded-2xl border bg-white text-[#192A56] border-[#E5E9F2] text-sm font-semibold transition-all"
              >
                <span className={selectedCuisines.length === 0 ? "text-[#5C677D]" : "text-[#192A56]"}>
                  {selectedCuisines.length === 0 ? "Select cuisines..." : `${selectedCuisines.length} selected`}
                </span>
                <ChevronDown size={16} className={`text-[#5C677D] transition-transform ${cuisineOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {cuisineOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-[#E5E9F2] rounded-2xl shadow-lg overflow-hidden">

                  {/* Search */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E5E9F2]">
                    <Search size={14} className="text-[#5C677D] shrink-0" />
                    <input
                      autoFocus
                      value={cuisineSearch}
                      onChange={(e) => setCuisineSearch(e.target.value)}
                      placeholder="Search cuisine..."
                      className="flex-1 text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none bg-transparent"
                    />
                    {cuisineSearch && <button onClick={() => setCuisineSearch("")}><X size={13} className="text-[#5C677D]" /></button>}
                  </div>
                  {/* Options */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCuisineOptions.length === 0 ? (
                      <p className="text-xs text-[#5C677D] text-center py-4">No cuisines found</p>
                    ) : filteredCuisineOptions.map((c) => {
                      const selected = selectedCuisines.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => toggleCuisine(c)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#F0FDFB] ${
                            selected ? "text-[#2EC4B6] font-semibold bg-[#F0FDFB]" : "text-[#192A56]"
                          }`}
                        >
                          {c}
                          {selected && <Check size={14} className="text-[#2EC4B6]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-[11px] font-semibold text-[#5C677D] mb-1.5 uppercase tracking-wide">Difficulty</p>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-all ${
                    difficulty === d
                      ? "bg-[#2EC4B6] text-white border-[#2EC4B6]"
                      : "bg-white text-[#5C677D] border-[#E5E9F2]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Cook time */}
          <div>
            <p className="text-[11px] font-semibold text-[#5C677D] mb-1.5 uppercase tracking-wide">Cook Time</p>
            <div className="flex gap-2">
              {COOK_TIME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setMaxCookTime(o.value)}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold border transition-all ${
                    maxCookTime === o.value
                      ? "bg-[#2EC4B6] text-white border-[#2EC4B6]"
                      : "bg-white text-[#5C677D] border-[#E5E9F2]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs font-semibold text-[#2EC4B6]">Clear all filters</button>
          )}
        </div>

        {/* User results */}
        {users.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#5C677D] uppercase tracking-wide">People</h3>
            {users.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-[#E5E9F2] shadow-sm">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[#2EC4B6] shrink-0 flex items-center justify-center text-white font-bold text-sm">
                    {user.avatar_url
                      ? <Image src={user.avatar_url} alt={user.username} fill className="object-cover" sizes="44px" />
                      : user.username[0].toUpperCase()
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#192A56]">
                      {user.username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-[#5C677D]">@{user.username}</p>
                    {user.bio && <p className="text-xs text-[#5C677D] mt-0.5 line-clamp-1">{user.bio}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No user results */}
        {query.trim().length >= 2 && !userPending && users.length === 0 && (
          <p className="text-center text-xs text-[#5C677D]">No users found for &quot;{query}&quot;</p>
        )}

        {/* Recipe results header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#5C677D] uppercase tracking-wide">
            {isPending ? "Searching..." : `Recipes (${recipes.length})`}
          </h3>
          {isPending && <Loader2 size={14} className="text-[#2EC4B6] animate-spin" />}
        </div>

        {/* Recipe cards — same as home */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {!isPending && recipes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <p className="text-3xl">🔍</p>
            <p className="text-sm font-semibold text-[#192A56]">No recipes found</p>
            <p className="text-xs text-[#5C677D]">Try different keywords or filters</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
