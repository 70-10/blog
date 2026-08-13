import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAutosave, type SaveStatus } from "../hooks/useAutosave";
import { createDraft, getDraft, updateDraft } from "../lib/api";

const MESSAGES: Record<SaveStatus, string> = {
  idle: "",
  pending: "未保存",
  saving: "保存しています",
  saved: "保存しました",
  empty: "中身が空なので保存していません",
  conflict: "他のところで変わっています。読み直してください",
  error: "保存できませんでした",
};

export function SaveStatusLabel({ status }: { status: SaveStatus }) {
  const message = MESSAGES[status];
  if (!message) return null;
  return (
    <p role="status" className="text-sm text-gray-600">
      {message}
    </p>
  );
}

export function DraftEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState({ title: "", body: "" });
  const [sha, setSha] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      const draft = await getDraft(id);
      if (cancelled) return;
      // 残したときの本文がそのまま入る。写し直しは要らない（US-02 の前提）。
      setTitle(draft.title);
      setBody(draft.body);
      setSaved({ title: draft.title, body: draft.body });
      setSha(draft.sha);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = useCallback(
    async (nextTitle: string, nextBody: string) => {
      if (id && sha) {
        const result = await updateDraft(id, nextTitle, nextBody, sha);
        setSha(result.sha);
      } else {
        // 最初の保存で識別子が決まる。空の編集画面を開いただけでは作らない。
        const created = await createDraft(nextTitle, nextBody);
        setSha(created.sha);
        void navigate(`/drafts/${created.id}`, { replace: true });
      }
      setSaved({ title: nextTitle, body: nextBody });
    },
    [id, sha, navigate],
  );

  const { status, flush } = useAutosave({ title, body, save, saved });

  if (loading) return <p>読み込んでいます</p>;

  return (
    <div className="flex flex-col gap-4">
      <input
        aria-label="タイトル"
        className="w-full border-b border-gray-300 py-2 text-xl outline-none"
        placeholder="タイトル（決まっていなくてよい）"
        value={title}
        onBlur={flush}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        aria-label="本文"
        className="min-h-[60vh] w-full resize-y font-mono outline-none"
        placeholder="思いついたことを書く"
        value={body}
        onBlur={flush}
        onChange={(event) => setBody(event.target.value)}
      />
      <SaveStatusLabel status={status} />
    </div>
  );
}
