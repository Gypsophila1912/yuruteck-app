"use client";

import { useState, useEffect } from "react";
import { PointModal } from "@/components/admin/point-modal";

type PointLog = {
  id: string;
  userName: string | null;
  eventTitle: string | null;
  type: string;
  point: number;
  reason: string | null;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  MANUAL: "手動（その他）",
  ARTICLE: "記事投稿",
  PRESENTATION: "登壇",
};

export default function AdminPointsPage() {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    const res = await fetch("/api/admin/points");
    setLogs(await res.json());
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* ポイント付与ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full md:w-auto md:self-end px-10 py-3 bg-[#5cb85c] text-white font-bold rounded-xl border-2 border-gray-800 hover:bg-green-600 transition-all"
      >
        ポイント付与
      </button>

      {/* ログリスト */}
      <div className="flex flex-col gap-3">
        <h2 className="text-md font-bold text-gray-900">最近のポイントログ</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm font-bold text-center py-8">
            ログがありません
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white border-2 border-gray-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {log.userName ?? "?"}
                    <span className="text-[10px] px-1.5 py-0.5 border border-gray-800 rounded-full bg-blue-100 text-blue-800">
                      {typeLabels[log.type] || log.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px] mt-1">
                    {log.reason ?? "理由なし"}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {fmt(log.createdAt)} - {log.eventTitle ?? "?"}
                  </div>
                </div>
                <div className="text-[#5cb85c] font-black text-xl">
                  +{log.point}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PointModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchLogs();
        }}
      />
    </div>
  );
}
