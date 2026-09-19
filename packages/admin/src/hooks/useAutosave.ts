import { useCallback, useEffect, useRef, useState } from "react";
import { hasContent } from "../../shared/draft";

/** 入力が止まってから保存するまでの待ち（design/logic-model.md）。 */
export const AUTOSAVE_DELAY_MS = 3000;

export type SaveStatus =
  "idle" | "pending" | "saving" | "saved" | "empty" | "conflict" | "error";

type Options = {
  title: string;
  body: string;
  /** 保存する処理。呼び出し側が新規作成と更新を出し分ける。 */
  save: (title: string, body: string) => Promise<void>;
  /** 最後に保存済みの内容。ここと同じなら送らない。 */
  saved: { title: string; body: string };
};

/**
 * 打っている間は保存しない。入力が止まって 3 秒で 1 回だけ送る。
 * フォーカスが外れたときとタブが隠れたときは待たずに送る。
 * タブを閉じるときの通信は届く保証がないので当てにしない。
 */
export function useAutosave({ title, body, save, saved }: Options): {
  status: SaveStatus;
  flush: () => void;
} {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlight = useRef(false);
  const again = useRef(false);
  const latest = useRef({ title, body, saved, save });

  latest.current = { title, body, saved, save };

  const run = useCallback(async () => {
    const current = latest.current;

    if (
      current.title === current.saved.title &&
      current.body === current.saved.body
    ) {
      return;
    }

    // 空にしたら保存しない。最後に保存された中身がそのまま残る（design/rules.md）。
    // 黙って見送らず、保存していないことを画面に出す。
    if (!hasContent(current.title, current.body)) {
      setStatus("empty");
      return;
    }

    // 送っている間に次の合図が来たら、並べて送らずに終わってから判定し直す。
    // 並べて送ると sha がずれて 409 になる。
    if (inFlight.current) {
      again.current = true;
      return;
    }

    inFlight.current = true;
    setStatus("saving");
    try {
      await current.save(current.title, current.body);
      setStatus("saved");
    } catch (error) {
      setStatus(
        error instanceof Error && error.name === "ApiError" && "status" in error
          ? (error as { status: number }).status === 409
            ? "conflict"
            : "error"
          : "error",
      );
    } finally {
      inFlight.current = false;
      if (again.current) {
        again.current = false;
        void run();
      }
    }
  }, []);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    void run();
  }, [run]);

  useEffect(() => {
    if (title === saved.title && body === saved.body) return;

    setStatus("pending");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void run(), AUTOSAVE_DELAY_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [title, body, saved.title, saved.body, run]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [flush]);

  return { status, flush };
}
