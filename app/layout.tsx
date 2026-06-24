import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import FloatingAI from "@/components/layout/FloatingAI";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "RecipeVerse AI",
  description: "AI-Powered Recipe Sharing Social Platform",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="min-h-full font-sans antialiased bg-[#E8EAF0]">
        <AuthProvider>
          <div className="min-h-screen flex bg-[#F9FBFF] lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1536px] lg:mx-auto lg:shadow-[0_0_40px_rgba(0,0,0,0.10)]">

            {/* Sidebar — only on lg+ */}
            <Sidebar />

            {/* Main content — fills remaining space */}
            <div className="flex-1 relative min-h-screen max-w-lg mx-auto w-full lg:max-w-none lg:mx-0">
              {children}
              <FloatingAI />
            </div>

          </div>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
