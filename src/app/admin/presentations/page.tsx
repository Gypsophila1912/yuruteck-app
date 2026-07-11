"use client";

import { useState, useEffect, useCallback } from "react";

type EventItem = {
  id: string;
  title: string;
  presentationOrderJson: string[] | null;
};
type Article = {
  id: string;
  userId: string;
  title: string;
  url: string;
  userName: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AdminPresentationsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<Article[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      });
  }, []);

  const fetchArticles = useCallback(async (eventId: string) => {
    if (!eventId) return;
    const res = await fetch(`/api/admin/presentations?eventId=${eventId}`);
    const data = await res.json();
    setArticles(data.articles ?? []);
    if (data.presentationOrderJson && data.presentationOrderJson.length > 0) {
      const orderedIds: string[] = data.presentationOrderJson;
      const articleMap = new Map(
        (data.articles ?? []).map((a: Article) => [a.id, a]),
      );
      const restored = orderedIds
        .map((id) => articleMap.get(id))
        .filter(Boolean) as Article[];
      setOrder(restored);
      setChecked(new Set(orderedIds));
    } else {
      setOrder([]);
      setChecked(new Set());
    }
  }, []);

  useEffect(() => {
    fetchArticles(selectedEventId);
  }, [selectedEventId, fetchArticles]);

  const toggleCheck = (article: Article) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(article.id)) next.delete(article.id);
      else next.add(article.id);
      return next;
    });
    setOrder([]);
  };

  const generateOrder = () => {
    const selected = articles.filter((a) => checked.has(a.id));
    setOrder(shuffle(selected));
  };

  const saveOrder = async () => {
    setSaving(true);
    await fetch("/api/admin/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: selectedEventId,
        orderIds: order.map((a) => a.id),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const buildDiscordText = () => {
    if (order.length === 0) return "";
    const lines = order.map(
      (a, i) => `${i + 1}. ${a.userName ?? "?"} さん - [${a.title}](${a.url})`,
    );
    return `【発表順】\n${lines.join("\n")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildDiscordText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* イベント選択 */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-800">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          対象イベント
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-800 rounded-lg px-3 py-2 text-gray-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5cb85c]"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 記事一覧 */}
        <div className="flex-1 bg-white border-2 border-gray-800 rounded-xl p-4">
          <h2 className="text-md font-bold text-gray-900 mb-3 border-b-2 border-gray-800 pb-2">
            記事一覧から選択
          </h2>
          {articles.length === 0 ? (
            <p className="text-gray-500 text-sm font-bold text-center py-4">
              記事がありません
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {articles.map((a) => (
                <label
                  key={a.id}
                  className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(a.id)}
                    onChange={() => toggleCheck(a)}
                    className="mt-1 w-4 h-4 text-[#5cb85c] focus:ring-[#5cb85c] border-gray-800 rounded"
                  />
                  <div>
                    <div className="text-gray-900 text-sm font-bold">
                      {a.userName ?? "?"}
                    </div>
                    <div className="text-gray-500 text-xs line-clamp-2 mt-0.5">
                      {a.title}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <button
            onClick={generateOrder}
            disabled={checked.size === 0}
            className="mt-4 w-full py-3 bg-[#5cb85c] text-white font-bold rounded-xl border-2 border-gray-800 hover:bg-green-600 transition-all disabled:opacity-50"
          >
            🎲 ランダム発表順を生成
          </button>
        </div>

        {/* 発表順 */}
        <div className="flex-1 bg-[#5cb85c] border-2 border-gray-800 rounded-xl p-4">
          <h2 className="text-md font-bold text-white mb-3 border-b-2 border-white/30 pb-2">
            決定した発表順
          </h2>
          {order.length === 0 ? (
            <p className="text-white/80 text-sm font-bold text-center py-4">
              左で選択して生成してください
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-4">
                {order.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-2 bg-white border-2 border-gray-800 rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-[#5cb85c] text-white font-black text-sm rounded-md border-2 border-gray-800">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-gray-900 text-sm font-bold">
                        {a.userName ?? "?"}
                      </div>
                      <div className="text-gray-500 text-xs truncate max-w-[200px]">
                        {a.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-white/30">
                <button
                  onClick={saveOrder}
                  disabled={saving}
                  className="w-full py-3 bg-white text-[#5cb85c] font-black rounded-xl border-2 border-gray-800 hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {saving
                    ? "保存中..."
                    : saved
                      ? "🎉 保存完了！"
                      : "💾 発表順を保存する"}
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full py-3 bg-blue-500 text-white font-black rounded-xl border-2 border-gray-800 hover:bg-blue-600 transition-all"
                >
                  {copied ? "✅ コピーしました！" : "📋 Discord用にコピー"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
