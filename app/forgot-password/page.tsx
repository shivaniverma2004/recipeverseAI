"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ChevronLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  }

  const formPanel = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F9FBFF] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 bg-gradient-to-br from-[#2EC4B6] to-[#28b0a3] px-12 gap-6">
        <div className="text-7xl xl:text-8xl">🔑</div>
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight text-center">RecipeVerse AI</h1>
        <p className="text-white/80 text-lg xl:text-xl text-center max-w-sm">No worries — we&apos;ll get you back in the kitchen in no time.</p>
      </div>
      {/* Right form panel */}
      <div className="flex items-center justify-center w-full lg:w-[460px] xl:w-[520px] 2xl:w-[560px] shrink-0 px-6 lg:px-12 xl:px-16 bg-[#F9FBFF]">
        <div className="w-full max-w-sm lg:max-w-none">{children}</div>
      </div>
    </div>
  );

  if (sent) {
    return formPanel(
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#2EC4B6]/10 flex items-center justify-center">
          <CheckCircle size={36} className="text-[#2EC4B6]" />
        </div>
        <h2 className="text-xl xl:text-2xl font-bold text-[#192A56]">Check your email</h2>
        <p className="text-sm text-[#5C677D] leading-relaxed">
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link.
        </p>
        <Link href="/login" className="w-full h-[52px] rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-sm transition-colors flex items-center justify-center mt-2">
          Back to Login
        </Link>
      </div>
    );
  }

  return formPanel(
    <div className="flex flex-col py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-[#192A56] hover:text-[#2EC4B6] transition-colors mb-6 w-fit"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="mb-8">
        <h2 className="text-2xl xl:text-[28px] font-bold text-[#192A56]">Reset Password</h2>
        <p className="text-sm text-[#5C677D] mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleReset} className="w-full space-y-4">
        <div className="flex items-center gap-3 bg-[#F7F3E3] border border-[#E5E9F2] rounded-2xl px-4 h-[52px]">
          <Mail size={18} className="text-[#5C677D] shrink-0" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#192A56] placeholder:text-[#5C677D] outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] rounded-full bg-[#2EC4B6] hover:bg-[#28b0a3] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#5C677D] text-center">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-[#2EC4B6] hover:underline">Login</Link>
      </p>
    </div>
  );
}
