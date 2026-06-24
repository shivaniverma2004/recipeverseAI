import { Suspense } from "react";
import HomeFeedClient from "./HomeFeedClient";
import { getRecipes } from "@/lib/actions/recipes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recipes = await getRecipes();
  return (
    <Suspense fallback={null}>
      <HomeFeedClient initialRecipes={recipes} />
    </Suspense>
  );
}
