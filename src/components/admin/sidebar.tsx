"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Trophy, Mic, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/events", label: "イベント管理", icon: Calendar },
  { href: "/admin/points", label: "ポイント管理", icon: Trophy },
  { href: "/admin/presentations", label: "発表管理", icon: Mic },
  { href: "/admin/members", label: "メンバー管理", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#161b22] border-r border-white/10 flex flex-col shrink-0">
      <div className="p-4 border-b border-white/10">
        <span className="text-base font-bold text-white">ゆるテック</span>
        <span className="ml-2 text-xs text-gray-500">管理画面</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
