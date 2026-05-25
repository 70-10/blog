import { Link, useParams } from "react-router";

type Props = {
  mode: "new" | "edit";
};

export function PostEditor({ mode }: Props) {
  const params = useParams<{ slug?: string }>();
  const heading = mode === "new" ? "新規記事" : `編集: ${params.slug ?? ""}`;
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <Link to="/posts" className="text-gray-500 hover:text-gray-900">
          ← 一覧へ
        </Link>
      </header>
      <p className="text-gray-500">
        エディタは Phase B+C で実装します。新規/編集モードのプレースホルダです。
      </p>
    </main>
  );
}
