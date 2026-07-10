import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();

  return (
    <main className="p-24 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-red-500 mb-8">管理画面トップ</h1>
      <p>
        ようこそ、管理者 <strong>{session?.user?.name}</strong> さん。
      </p>
      <p className="mt-4 text-gray-400">
        （※この画面が見えているということは、権限ガードを突破できています！）
      </p>
    </main>
  );
}
