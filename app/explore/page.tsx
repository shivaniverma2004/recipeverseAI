import { searchRecipes } from "@/lib/actions/explore";
import ExploreClient from "./ExploreClient";
import { cuisines, difficulties } from "@/lib/dummy-data";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  // Initial load: all recipes, no filters
  const initialRecipes = await searchRecipes({});

  return (
    <ExploreClient
      initialRecipes={initialRecipes}
      cuisines={cuisines}
      difficulties={difficulties}
    />
  );
}
