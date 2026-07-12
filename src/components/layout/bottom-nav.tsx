"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navs = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/articles", label: "記事閲覧", icon: BookOpen },
    { href: "/mypage", label: "マイページ", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-800 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      {navs.map((nav) => {
        const isActive = pathname === nav.href;
        return (
          <Link
            key={nav.href}
            href={nav.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 border-r-2 border-gray-800 last:border-r-0 ${
              isActive
                ? "bg-[#5cb85c] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <nav.icon
              size={20}
              className={isActive ? "text-white" : "text-[#5cb85c]"}
            />
            <span className="text-[10px] font-bold">{nav.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
