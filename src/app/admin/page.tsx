import Link from "next/link";
import { Calendar, Trophy, Mic, Users } from "lucide-react";

const cards = [
  {
    href: "/admin/events",
    label: "イベント管理",
    icon: Calendar,
    desc: "次回イベント設定・ログ",
  },
  {
    href: "/admin/points",
    label: "ポイント管理",
    icon: Trophy,
    desc: "手動・記事・登壇ポイント付与",
  },
  {
    href: "/admin/presentations",
    label: "発表管理",
    icon: Mic,
    desc: "発表者の選択・順番の決定",
  },
  {
    href: "/admin/members",
    label: "メンバー管理",
    icon: Users,
    desc: "ユーザー一覧・権限変更",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
      {cards.map(({ href, label, icon: Icon, desc }) => (
        <Link
          key={href}
          href={href}
          className="bg-white border-2 border-gray-800 rounded-xl p-4 hover:bg-gray-50 transition-all flex items-center gap-4 group"
        >
          <div className="p-3 bg-green-100 border-2 border-gray-800 rounded-lg shrink-0">
            <Icon size={24} className="text-[#5cb85c]" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg mb-0.5">
              {label}
            </div>
            <p className="text-xs text-gray-600 font-medium">{desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
