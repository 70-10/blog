import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { DraftSummary } from "../../shared/types";
import { listDrafts } from "../lib/api";

/** タイトルが決まっていない下書きの見せ方。
 * 本文の冒頭で見分けられるようにするのは Unit 4（organize-drafts）。 */
export const UNTITLED = "（無題）";

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString("ja-JP");
}

export function DraftListPage() {
  const [drafts, setDrafts] = useState<DraftSummary[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await listDrafts();
      if (!cancelled) setDrafts(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!drafts) return <p>読み込んでいます</p>;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/drafts/new"
        className="self-start rounded bg-gray-900 px-4 py-2 text-white"
      >
        新しく書く
      </Link>

      {/* 下書きが 1 件も無いのはエラーではない（design/rules.md） */}
      {drafts.length === 0 ? (
        <p>下書きはありません</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200">
          {drafts.map((draft) => (
            <li key={draft.id}>
              <Link to={`/drafts/${draft.id}`} className="flex flex-col py-3">
                <span className={draft.title ? "" : "text-gray-500"}>
                  {draft.title || UNTITLED}
                </span>
                <time className="text-sm text-gray-500">
                  {formatUpdatedAt(draft.updatedAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
