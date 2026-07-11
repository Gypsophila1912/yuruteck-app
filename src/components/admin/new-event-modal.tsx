"use client";

import { useState } from "react";

type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

export function NewEventModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isRegular, setIsRegular] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startAt, endAt, isRegular }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("作成に失敗しました");
      return;
    }
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#fcfaf2] border-2 border-gray-800 rounded-2xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="bg-[#5cb85c] px-4 py-3 border-b-2 border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">次回イベント設定</h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-xl leading-none hover:opacity-80"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              イベント名 (空で自動採番)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="第◯回"
              className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              開始日時
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              終了日時
            </label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
              className="w-full bg-white border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
              <input
                type="radio"
                checked={isRegular}
                onChange={() => setIsRegular(true)}
                className="w-4 h-4 text-[#5cb85c] focus:ring-[#5cb85c] border-gray-800"
              />
              通常 (毎週)
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
              <input
                type="radio"
                checked={!isRegular}
                onChange={() => setIsRegular(false)}
                className="w-4 h-4 text-[#5cb85c] focus:ring-[#5cb85c] border-gray-800"
              />
              特別
            </label>
          </div>

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-[#5cb85c] text-white font-bold rounded-xl border-2 border-gray-800 hover:bg-green-600 transition-all disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </div>
  );
}
