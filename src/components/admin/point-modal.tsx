"use client";

import { useState, useEffect, useCallback } from "react";

type User = { id: string; displayName: string };
type EventItem = { id: string; title: string };
type PointLog = {
  id: string;
  userId: string;
  eventId: string;
  type: "ARTICLE" | "PRESENTATION" | "MANUAL";
  point: number;
  reason: string | null;
  createdAt: string;
  userName: string | null;
  eventTitle: string | null;
};

type Props = { isOpen: boolean; onClose: () => void };

const typeLabels: Record<string, string> = {
  MANUAL: "手動（その他）",
  ARTICLE: "記事投稿",
  PRESENTATION: "登壇",
};

export function PointModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<"grant" | "edit">("grant");
  const [userList, setUserList] = useState<User[]>([]);
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [logs, setLogs] = useState<PointLog[]>([]);

  const [userId, setUserId] = useState("");
  const [eventId, setEventId] = useState("");
  const [type, setType] = useState<"ARTICLE" | "PRESENTATION" | "MANUAL">(
    "MANUAL",
  );
  const [reason, setReason] = useState("");
  const [point, setPoint] = useState(1);
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantSuccess, setGrantSuccess] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoint, setEditPoint] = useState(1);
  const [editReason, setEditReason] = useState("");

  const fetchAll = useCallback(async () => {
    const [u, e, l] = await Promise.all([
      fetch("/api/admin/members").then((r) => r.json()),
      fetch("/api/admin/events").then((r) => r.json()),
      fetch("/api/admin/points").then((r) => r.json()),
    ]);
    setUserList(u);
    setEventList(e);
    setLogs(l);
  }, []);

  useEffect(() => {
    if (isOpen) fetchAll();
  }, [isOpen, fetchAll]);

  if (!isOpen) return null;

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantLoading(true);
    setGrantError(null);
    const res = await fetch("/api/admin/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, eventId, type, reason, point }),
    });
    if (!res.ok) {
      const d = await res.json();
      setGrantError(d.error || "失敗しました");
      setGrantLoading(false);
      return;
    }
    setGrantSuccess(true);
    setGrantLoading(false);
    await fetchAll();
    setTimeout(() => setGrantSuccess(false), 2000);
  };

  const handleEdit = async (id: string) => {
    await fetch(`/api/admin/points/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ point: editPoint, reason: editReason }),
    });
    setEditingId(null);
    await fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このポイントログを削除しますか？")) return;
    await fetch(`/api/admin/points/${id}`, { method: "DELETE" });
    await fetchAll();
  };

  const startEdit = (log: PointLog) => {
    setEditingId(log.id);
    setEditPoint(log.point);
    setEditReason(log.reason ?? "");
  };

  const handleClose = () => {
    setTab("grant");
    setGrantError(null);
    setGrantSuccess(false);
    setEditingId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#fcfaf2] border-2 border-gray-800 rounded-2xl w-full max-w-lg h-[550px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#5cb85c] border-b-2 border-gray-800 shrink-0">
          <div className="flex gap-2">
            {(["grant", "edit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${
                  tab === t
                    ? "bg-white text-gray-900 border-gray-800"
                    : "bg-transparent text-white border-transparent hover:bg-white/20"
                }`}
              >
                {t === "grant" ? "付与する" : "編集・削除"}
              </button>
            ))}
          </div>
          <button
            onClick={handleClose}
            className="text-white font-bold text-2xl leading-none hover:opacity-80"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1 p-4">
          {tab === "grant" ? (
            <form onSubmit={handleGrant} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    ユーザー
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
                  >
                    <option value="">選択してください</option>
                    {userList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    イベント
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
                  >
                    <option value="">選択してください</option>
                    {eventList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    種別
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as typeof type)}
                    className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
                  >
                    <option value="MANUAL">手動（その他）</option>
                    <option value="ARTICLE">記事投稿</option>
                    <option value="PRESENTATION">登壇</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    ポイント数
                  </label>
                  <input
                    type="number"
                    value={point}
                    onChange={(e) => setPoint(Number(e.target.value))}
                    min={1}
                    className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  理由{" "}
                  {type === "MANUAL" && (
                    <span className="text-red-500">（必須）</span>
                  )}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="例: 部会での発言が参考になったため"
                  className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
                />
              </div>
              {grantError && (
                <p className="text-red-500 text-xs font-bold">{grantError}</p>
              )}
              {grantSuccess && (
                <p className="text-[#5cb85c] text-sm font-bold text-center">
                  🎉 付与しました！
                </p>
              )}
              <button
                type="submit"
                disabled={grantLoading}
                className="mt-2 w-full py-3 bg-[#5cb85c] text-white font-bold rounded-xl border-2 border-gray-800 hover:bg-green-600 transition-all disabled:opacity-50"
              >
                {grantLoading ? "付与中..." : "ポイントを付与する"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm font-bold text-center py-8">
                  ポイントログがありません
                </p>
              ) : (
                logs.map((log) =>
                  editingId === log.id ? (
                    <div
                      key={log.id}
                      className="bg-white border-2 border-gray-800 rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editPoint}
                          onChange={(e) => setEditPoint(Number(e.target.value))}
                          min={1}
                          className="w-20 bg-gray-50 border-2 border-gray-800 rounded-lg px-2 py-1 text-gray-900 text-sm font-bold"
                        />
                        <input
                          type="text"
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="理由"
                          className="flex-1 bg-gray-50 border-2 border-gray-800 rounded-lg px-2 py-1 text-gray-900 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 font-bold text-xs rounded-lg border-2 border-gray-800"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleEdit(log.id)}
                          className="px-3 py-1 bg-[#5cb85c] text-white font-bold text-xs rounded-lg border-2 border-gray-800 hover:bg-green-600"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={log.id}
                      className="bg-white border-2 border-gray-800 rounded-xl p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-900">
                            {log.userName ?? "?"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.eventTitle ?? "?"}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-0.5 border-2 border-gray-800 rounded-full font-bold bg-blue-100 text-blue-800">
                            {typeLabels[log.type] || log.type}
                          </span>
                          <div className="text-[#5cb85c] font-black text-lg">
                            +{log.point} pt
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 border-t-2 border-dashed border-gray-200 pt-2 mb-2">
                        {log.reason ?? "理由なし"}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(log)}
                          className="text-xs font-bold text-gray-600 bg-gray-100 border-2 border-gray-800 px-2 py-1 rounded-md hover:bg-gray-200"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-xs font-bold text-white bg-red-500 border-2 border-gray-800 px-2 py-1 rounded-md hover:bg-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
