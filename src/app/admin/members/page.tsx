"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type User = {
  id: string;
  discordId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const res = await fetch("/api/admin/members");
    setMembers(await res.json());
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`${user.displayName} のroleを ${newRole} に変更しますか？`))
      return;
    setLoadingId(user.id);
    await fetch(`/api/admin/members/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await fetchMembers();
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      {members.length === 0 ? (
        <p className="text-gray-500 text-sm font-bold text-center py-8">
          メンバーがいません
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((user) => (
            <div
              key={user.id}
              className="bg-white border-2 border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-gray-800 object-cover bg-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-gray-800 flex items-center justify-center font-bold text-blue-500 text-lg shrink-0">
                    {user.displayName[0]}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900 leading-tight text-lg">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-gray-500 font-medium mt-0.5">
                    @{user.username}
                  </div>
                </div>
                <div className="hidden sm:block ml-4">
                  <span
                    className={`text-xs px-3 py-1 border-2 border-gray-800 rounded-full font-bold ${
                      user.role === "ADMIN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t-2 border-gray-100 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                <div className="sm:hidden">
                  <span
                    className={`text-xs px-3 py-1 border-2 border-gray-800 rounded-full font-bold ${
                      user.role === "ADMIN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => toggleRole(user)}
                  disabled={loadingId === user.id}
                  className="text-sm px-6 py-2 border-2 border-gray-800 font-bold rounded-lg transition-all hover:bg-gray-200 disabled:opacity-50 bg-gray-50 text-gray-700 shrink-0"
                >
                  {loadingId === user.id
                    ? "変更中..."
                    : user.role === "ADMIN"
                      ? "降格"
                      : "昇格"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
