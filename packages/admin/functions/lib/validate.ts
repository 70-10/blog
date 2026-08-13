/** 誤操作と暴走を止めるための上限。受け入れ条件が定めた数ではない（design/rules.md）。 */
export const TITLE_MAX = 1000;
export const BODY_MAX = 1_000_000;

export type Invalid = { message: string };

/** 画面を信じない。裏側でも同じ検査をする。 */
export function validateDraftInput(
  value: unknown,
): { title: string; body: string } | Invalid {
  if (typeof value !== "object" || value === null) {
    return { message: "本文の形が正しくありません" };
  }
  const { title, body } = value as Record<string, unknown>;

  if (typeof title !== "string")
    return { message: "title が文字列ではありません" };
  if (typeof body !== "string")
    return { message: "body が文字列ではありません" };
  if (title.length > TITLE_MAX) {
    return { message: `title が長すぎます（${TITLE_MAX} 文字まで）` };
  }
  if (body.length > BODY_MAX) {
    return { message: `body が長すぎます（${BODY_MAX} 文字まで）` };
  }

  return { title, body };
}

export function isInvalid(
  value: { title: string; body: string } | Invalid,
): value is Invalid {
  return "message" in value;
}
