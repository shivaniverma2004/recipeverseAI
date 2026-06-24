import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getProfileStats, getIsFollowing } from "@/lib/actions/social";
import { getRecipesByUser } from "@/lib/actions/recipes";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // "me" resolves to the logged-in user's id
  const profileId = id === "me" ? user.id : id;

  let profile;
  try {
    profile = await getProfile(profileId);
  } catch {
    notFound();
  }

  const [stats, recipes, isFollowing] = await Promise.all([
    getProfileStats(profileId),
    getRecipesByUser(profileId),
    getIsFollowing(profileId),
  ]);

  const isOwn = profileId === user.id;

  return (
    <ProfileClient
      profile={profile}
      stats={stats}
      recipes={recipes}
      isOwn={isOwn}
      initialIsFollowing={isFollowing}
    />
  );
}
