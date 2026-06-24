"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !email || !password || !confirm) return toast.error("Please fill in all fields");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (username.length < 3) return toast.error("Username must be at least 3 characters");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Welcome to RecipeVerse AI 🍳");
      router.push("/home");
      router.refresh();
    }

  }

  const field = (placeholder: string, value: string, onChange: (v: string) => void, type: string, icon: React.ReactNode, toggle?: React.ReactNode) => (
    <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
      <span className="text-[#5C677D] shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[13px] text-[#192A56] placeholder:text-[#5C677D] outline-none"
      />
      {toggle}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex">

      {/* Left branding panel — only on lg+ */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-[#2EC4B6] to-[#28b0a3] px-12 gap-6">
        <div className="text-7xl xl:text-8xl">🍳</div>
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight text-center">Join RecipeVerse AI</h1>
        <p className="text-white/80 text-lg xl:text-xl text-center max-w-sm">Share your recipes, follow great chefs, and get AI cooking help.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col w-full lg:w-[460px] xl:w-[520px] 2xl:w-[560px] shrink-0 px-6 lg:px-12 xl:px-16 py-8 bg-[#F9FBFF]">
        <div className="w-full max-w-sm mx-auto lg:max-w-none flex flex-col flex-1">

          <button onClick={() => router.back()} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#E5E9F2] transition-colors mb-6 -ml-1 mt-2">
            <ChevronLeft size={22} className="text-[#192A56]" />
          </button>

          <div className="mb-7">
            <h2 className="text-[22px] xl:text-[26px] font-bold text-[#192A56]">Create Your Account</h2>
            <p className="text-[13px] text-[#5C677D] mt-1">Join RecipeVerse AI today</p>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            {field("Username", username, setUsername, "text", <User size={17} />)}
            {field("Email address", email, setEmail, "email", <Mail size={17} />)}
            {field(
              "Password", password, setPassword,
              showPassword ? "text" : "password",
              <Lock size={17} />,
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#5C677D] shrink-0">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            )}
            {field(
              "Confirm password", confirm, setConfirm,
              showConfirm ? "text" : "password",
              <Lock size={17} />,
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#5C677D] shrink-0">
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] mt-1 rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-[13px] text-[#5C677D] text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#2EC4B6] hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
