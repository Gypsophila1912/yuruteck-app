"use client";

import { useState, useEffect } from "react";
import { NewEventModal } from "@/components/admin/new-event-modal";

type EventItem = {
  id: string;
  title: string;
  isRegular: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    setEvents(await res.json());
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* 新規作成ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full md:w-auto md:self-end px-10 py-3 bg-[#5cb85c] text-white font-bold rounded-xl border-2 border-gray-800 hover:bg-green-600 transition-all"
      >
        ＋ 新規イベント作成
      </button>

      {/* イベントリスト */}
      <div className="flex flex-col gap-3">
        <h2 className="text-md font-bold text-gray-900">過去のイベント</h2>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            イベントがまだありません
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border-2 border-gray-800 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{event.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border border-gray-800 font-bold ${
                      event.isRegular
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.isRegular ? "通常" : "特別"}
                  </span>
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  📅 {fmt(event.startAt)} 〜 {fmt(event.endAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
