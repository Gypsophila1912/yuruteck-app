import Link from "next/link";

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#5cb85c] text-white border-b-2 border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
      <Link href="/" className="text-xl font-bold tracking-wider">
        週刊ゆるてっく
      </Link>
      <button className="px-3 py-1 bg-white text-[#5cb85c] text-xs font-bold rounded-md border-2 border-gray-800 hover:bg-gray-50 transition-all">
        新規投稿
      </button>
    </header>
  );
}
