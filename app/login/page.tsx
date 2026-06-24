"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push("/home");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex">

      {/* Left branding panel — only on lg+ */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-[#2EC4B6] to-[#28b0a3] px-12 gap-6">
        <Image src="/icon.svg" alt="RecipeVerse AI" width={100} height={100} className="object-contain drop-shadow-lg" />
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight text-center">RecipeVerse AI</h1>
        <p className="text-white/80 text-lg xl:text-xl text-center max-w-sm">Discover, share, and cook amazing recipes powered by AI.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[460px] xl:w-[520px] 2xl:w-[560px] shrink-0 px-6 lg:px-12 xl:px-16 bg-[#F9FBFF]">
        <div className="w-full max-w-sm lg:max-w-none flex flex-col items-center">

          {/* Logo — mobile only */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <div className="w-[88px] h-[88px] rounded-full bg-[#2EC4B6]/10 flex items-center justify-center mb-3">
              <Image src="/icon.svg" alt="RecipeVerse AI" width={60} height={60} className="object-contain" />
            </div>
            <h1 className="text-[22px] font-bold text-[#2EC4B6] tracking-tight">RecipeVerse AI</h1>
          </div>

          <div className="text-center lg:text-left w-full mb-7">
            <h2 className="text-[20px] xl:text-[24px] font-bold text-[#192A56]">Welcome Back!</h2>
            <p className="text-[13px] text-[#5C677D] mt-1">Login to continue</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-3">
            <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
              <Mail size={17} className="text-[#5C677D] shrink-0" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-[#192A56] placeholder:text-[#5C677D] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
              <Lock size={17} className="text-[#5C677D] shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-[#192A56] placeholder:text-[#5C677D] outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[#5C677D] shrink-0">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-[12px] font-semibold text-[#2EC4B6] hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] mt-1 rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-[15px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-7 text-[13px] text-[#5C677D]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#2EC4B6] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
