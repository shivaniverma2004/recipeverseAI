"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/social";

export default function EditProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return router.push("/login");
      const { data } = await supabase.from("profiles").select("username, bio, avatar_url").eq("id", user.id).single();
      if (data) {
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatar_url ?? null);
      }
    });
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return toast.error("Username is required");
    if (username.length < 3) return toast.error("Username must be at least 3 characters");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("bio", bio.trim());
      if (avatarFile) formData.append("avatar", avatarFile);
      await updateProfile(formData);
      toast.success("Profile updated!");
      router.back();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const displayAvatar = avatarPreview ?? avatarUrl;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-[#F7F3E3] border-b border-[#E5E9F2]">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-[#E5E9F2] transition-colors">
          <ChevronLeft size={22} className="text-[#192A56]" />
        </button>
        <span className="text-[15px] font-bold text-[#192A56]">Edit Profile</span>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSave} className="flex-1 px-4 py-6 space-y-6 max-w-lg mx-auto w-full">

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2EC4B6] border-4 border-white shadow-md">
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#2EC4B6] rounded-full flex items-center justify-center border-2 border-white shadow"
            >
              <Camera size={15} className="text-white" />
            </button>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-[#2EC4B6]">
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-[#192A56] mb-1.5">Username</label>
          <div className="flex items-center bg-[#F7F3E3] border border-[#E5E9F2] rounded-xl px-4 h-12 focus-within:border-[#2EC4B6] transition-colors">
            <span className="text-[#5C677D] text-sm mr-1">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
              placeholder="your_username"
              className="flex-1 bg-transparent text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none"
            />
          </div>
          <p className="text-[11px] text-[#5C677D] mt-1">Only lowercase letters, numbers and underscores</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-[#192A56] mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself..."
            rows={4}
            maxLength={150}
            className="w-full bg-[#F7F3E3] border border-[#E5E9F2] rounded-xl px-4 py-3 text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none focus:border-[#2EC4B6] transition-colors resize-none"
          />
          <p className="text-[11px] text-[#5C677D] text-right mt-1">{bio.length}/150</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
