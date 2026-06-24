"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PenLine } from "lucide-react";

const navItems = [
  { href: "/home",    icon: Home,    label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/create",  icon: PenLine, label: "Create" },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-[#F7F3E3] border-t border-[#E5E9F2] safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around h-[60px] px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-[3px] flex-1 h-full">
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-[#2EC4B6]" : "text-[#5C677D]"} />
              <span className={`text-[10px] font-medium leading-none ${active ? "text-[#2EC4B6]" : "text-[#5C677D]"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
