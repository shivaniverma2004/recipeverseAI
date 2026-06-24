import { notFound, redirect } from "next/navigation";
import { getRecipeById } from "@/lib/actions/recipes";
import { createClient } from "@/lib/supabase/server";
import EditRecipeClient from "./EditRecipeClient";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let recipe;
  try {
    recipe = await getRecipeById(id);
  } catch {
    notFound();
  }

  if (recipe.user_id !== user.id) redirect(`/recipe/${id}`);

  return <EditRecipeClient recipe={recipe} />;
}
