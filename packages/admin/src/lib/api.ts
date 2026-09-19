import type { Draft, DraftSummary } from "../../shared/types";

/** 裏側の応答。認証は Cloudflare Access が済ませているので、ここでは扱わない。 */
export type SavedDraft = { id: string; updatedAt: string; sha: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new ApiError(response.status, body.message ?? "失敗しました");
  }

  return (await response.json()) as T;
}

export function listDrafts(): Promise<DraftSummary[]> {
  return request<DraftSummary[]>("/api/drafts");
}

export function getDraft(id: string): Promise<Draft & { sha: string }> {
  return request<Draft & { sha: string }>(
    `/api/drafts/${encodeURIComponent(id)}`,
  );
}

export function createDraft(
  title: string,
  body: string,
): Promise<SavedDraft & { createdAt: string }> {
  return request<SavedDraft & { createdAt: string }>("/api/drafts", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
}

export function updateDraft(
  id: string,
  title: string,
  body: string,
  sha: string,
): Promise<SavedDraft> {
  return request<SavedDraft>(`/api/drafts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ title, body, sha }),
  });
}
