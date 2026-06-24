"use server";

import { createClient } from "@/lib/supabase/server";

export interface ExploreFilters {
  recipeQuery?: string;
  userQuery?: string;
  cuisines?: string[];
  difficulty?: string;
  maxCookTime?: number;
}

export async function searchRecipes(filters: ExploreFilters) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("recipes")
    .select("*, author:profiles(id, username, avatar_url), likes(id, user_id)")
    .order("created_at", { ascending: false })
    .limit(30);

  if (filters.recipeQuery && filters.recipeQuery.trim().length >= 2) {
    query = query.ilike("title", `%${filters.recipeQuery.trim()}%`);
  }
  if (filters.cuisines && filters.cuisines.length > 0) {
    query = query.overlaps("cuisine", filters.cuisines);
  }
  if (filters.difficulty && filters.difficulty !== "All") {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.maxCookTime && filters.maxCookTime > 0) {
    query = query.lte("cook_time", filters.maxCookTime);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    ...r,
    likes_count: r.likes?.length ?? 0,
    is_liked: user ? r.likes?.some((l: { user_id: string }) => l.user_id === user.id) : false,
    likes: undefined,
  }));
}

export async function searchUsers(query: string) {
  if (!query || query.trim().length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .ilike("username", `%${query.trim()}%`)
    .limit(10);

  if (error) throw new Error(error.message);
  return data ?? [];
}
