"use client";

import { useState } from "react";
import { NewEventModal } from "./new-event-modal";

export function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="h-14 bg-[#161b22] border-b border-white/10 flex items-center justify-end px-6 shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition"
        >
          + 新規イベント作成
        </button>
      </header>
      <NewEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
