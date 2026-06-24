import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/actions/recipes";
import { createClient } from "@/lib/supabase/server";
import RecipeDetailClient from "./RecipeDetailClient";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipeById(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === recipe.user_id;

  return (
    <Suspense fallback={null}>
      <RecipeDetailClient recipe={recipe} isOwner={isOwner} />
    </Suspense>
  );
}
