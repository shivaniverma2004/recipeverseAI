"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProfileStats(userId: string) {
  const supabase = await createClient();

  const [recipesRes, followersRes, followingRes] = await Promise.all([
    supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
  ]);

  return {
    recipes_count: recipesRes.count ?? 0,
    followers_count: followersRes.count ?? 0,
    following_count: followingRes.count ?? 0,
  };
}

export async function getIsFollowing(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  return !!data;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatar_url: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(path, avatarFile, { upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const { data: { publicUrl } } = supabase.storage.from("recipe-images").getPublicUrl(path);
    avatar_url = publicUrl;
  }

  const updates: Record<string, string> = { username, bio };
  if (avatar_url) updates.avatar_url = avatar_url;

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/profile/me");
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (user.id === targetUserId) throw new Error("You cannot follow yourself");

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
  }

  revalidatePath(`/profile/${targetUserId}`);
  return !existing;
}
