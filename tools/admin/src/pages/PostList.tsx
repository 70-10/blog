import { Link } from "react-router";

export function PostList() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">記事一覧</h1>
        <Link
          to="/posts/new"
          className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
        >
          新規作成
        </Link>
      </header>
      <p className="text-gray-500">記事一覧は Phase E で実装します。</p>
    </main>
  );
}
