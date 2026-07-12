"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin", label: "ダッシュボード" },
    { href: "/admin/events", label: "イベント" },
    { href: "/admin/points", label: "ポイント" },
    { href: "/admin/presentations", label: "発表" },
    { href: "/admin/members", label: "メンバー" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#fdfbf4]">
      {/* 管理者画面タイトル */}
      <div className="px-4 py-3 border-b-2 border-gray-800 bg-white">
        <h1 className="text-lg font-bold text-gray-900">管理者画面</h1>
      </div>

      {/* スクロール可能な上部タブ */}
      <div className="overflow-x-auto bg-white border-b-2 border-gray-800 hide-scrollbar">
        <div className="flex px-2 w-max">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/admin" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-bold border-b-4 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#5cb85c] text-[#5cb85c]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ページコンテンツ */}
      <div className="flex-1 p-4 overflow-y-auto">{children}</div>
    </div>
  );
}
