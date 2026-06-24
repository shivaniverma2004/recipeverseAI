"use client";

import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
  topNavProps?: React.ComponentProps<typeof TopNav>;
}

export default function MainLayout({ children, topNavProps }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFF]">
      <TopNav {...topNavProps} />
      <main className="flex-1 overflow-y-auto pb-20 w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
