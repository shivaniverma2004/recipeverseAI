"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRecipes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let allowedUserIds: string[] = [];

  if (user) {
    // Get IDs of people current user follows
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
    // Include own recipes + following recipes
    allowedUserIds = [...followingIds, user.id];
  }

  let query = supabase
    .from("recipes")
    .select(`*, author:profiles(id, username, avatar_url), likes(id, user_id)`)
    .order("created_at", { ascending: false });

  if (allowedUserIds.length > 0) {
    query = query.in("user_id", allowedUserIds);
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

export async function getRecipeById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      author:profiles(id, username, avatar_url, bio),
      likes(id, user_id)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const { data: { user } } = await supabase.auth.getUser();

  return {
    ...data,
    likes_count: data.likes?.length ?? 0,
    is_liked: user ? data.likes?.some((l: { user_id: string }) => l.user_id === user.id) : false,
    likes: undefined,
  };
}

export async function getRecipesByUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`*, author:profiles(id, username, avatar_url), likes(id)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    ...r,
    likes_count: r.likes?.length ?? 0,
    is_liked: false,
    likes: undefined,
  }));
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let cover_image_url: string | null = null;
  const file = formData.get("cover_image") as File | null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(path, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from("recipe-images")
      .getPublicUrl(path);

    cover_image_url = urlData.publicUrl;
  }

  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const preparation_steps = JSON.parse(formData.get("preparation_steps") as string);
  const tags = JSON.parse(formData.get("tags") as string);

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      cover_image_url,
      ingredients,
      preparation_steps,
      prep_time: Number(formData.get("prep_time")),
      cook_time: Number(formData.get("cook_time")),
      servings: Number(formData.get("servings")),
      difficulty: formData.get("difficulty") as string,
      cuisine: JSON.parse(formData.get("cuisine") as string),
      tags,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath(`/profile/${user.id}`);
  return data;
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let cover_image_url: string | undefined = undefined;
  const file = formData.get("cover_image") as File | null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(path);
      cover_image_url = urlData.publicUrl;
    }
  }

  const ingredients = JSON.parse(formData.get("ingredients") as string);
  const preparation_steps = JSON.parse(formData.get("preparation_steps") as string);
  const tags = JSON.parse(formData.get("tags") as string);

  const updateData: Record<string, unknown> = {
    title: formData.get("title"),
    description: formData.get("description"),
    ingredients,
    preparation_steps,
    prep_time: Number(formData.get("prep_time")),
    cook_time: Number(formData.get("cook_time")),
    servings: Number(formData.get("servings")),
    difficulty: formData.get("difficulty"),
    cuisine: JSON.parse(formData.get("cuisine") as string),
    tags,
  };

  if (cover_image_url) updateData.cover_image_url = cover_image_url;

  const { error } = await supabase
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/recipe/${id}`);
  revalidatePath("/home");
  revalidatePath(`/profile/${user.id}`);
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath(`/profile/${user.id}`);
}

export async function toggleLike(recipeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .single();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ user_id: user.id, recipe_id: recipeId });
  }

  revalidatePath("/home");
  revalidatePath(`/recipe/${recipeId}`);
  return !existing;
}
