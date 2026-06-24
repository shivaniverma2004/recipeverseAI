"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated! Please log in.");
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-[#2EC4B6] to-[#28b0a3] px-12 gap-6">
        <div className="text-7xl xl:text-8xl">🔒</div>
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight text-center">RecipeVerse AI</h1>
        <p className="text-white/80 text-lg xl:text-xl text-center max-w-sm">Choose a strong new password to secure your account.</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center w-full lg:w-[460px] xl:w-[520px] 2xl:w-[560px] shrink-0 px-6 lg:px-12 xl:px-16 bg-[#F9FBFF]">
        <div className="w-full max-w-sm lg:max-w-none flex flex-col py-6">

          <div className="mb-8">
            <h2 className="text-2xl xl:text-[28px] font-bold text-[#192A56]">Set New Password</h2>
            <p className="text-sm text-[#5C677D] mt-1">Enter and confirm your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
              <Lock size={18} className="text-[#5C677D] shrink-0" />
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
              <Lock size={18} className="text-[#5C677D] shrink-0" />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
