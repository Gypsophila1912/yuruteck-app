import { auth, signIn, signOut } from "@/auth";
import Image from "next/image";

export default async function Home() {
  // サーバー側でセッション情報（ログイン中のユーザー情報）を取得
  const session = await auth();
  const user = session?.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ゆるテックアプリ</h1>

      <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center">
        {user ? (
          // ▼ ログイン中の表示 ▼
          <div className="flex flex-col items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt="Avatar"
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-sm text-gray-400">
              Role: <span className="text-blue-400">{user.role}</span>
            </div>

            {/* ログアウトボタン（サーバーアクション） */}
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
              >
                ログアウト
              </button>
            </form>
          </div>
        ) : (
          // ▼ 未ログイン時の表示 ▼
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-300">ログインして始める</p>

            {/* ログインボタン（サーバーアクション） */}
            <form
              action={async () => {
                "use server";
                await signIn("discord");
              }}
            >
              <button
                type="submit"
                className="px-6 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-md transition"
              >
                Login with Discord
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
