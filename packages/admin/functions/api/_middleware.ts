import { createRemoteJWKSet, jwtVerify } from "jose";

/** Cloudflare のダッシュボードで設定する値（design/data-model.md）。 */
export type Env = {
  /** <team>.cloudflareaccess.com。JWKS の取得先になる */
  ACCESS_TEAM_DOMAIN: string;
  /** Access アプリケーションの AUD タグ */
  ACCESS_AUD: string;
  /** 70-10/blog だけに絞った細かい権限のトークン（秘密の値） */
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
};

/** Pages Functions が渡してくるもののうち、ここで使う分だけ。 */
export type MiddlewareContext = {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
};

const ACCESS_HEADER = "Cf-Access-Jwt-Assertion";

let keySet: ReturnType<typeof createRemoteJWKSet> | undefined;
let keySetDomain: string | undefined;

/** テストで作り直すため。 */
export function resetKeyCache(): void {
  keySet = undefined;
  keySetDomain = undefined;
}

function getKeySet(teamDomain: string) {
  if (!keySet || keySetDomain !== teamDomain) {
    // createRemoteJWKSet は取った鍵を保持し、知らない kid が来たら取り直す。
    // 鍵は 6 週ごとに入れ替わるので埋め込まない。
    //
    // cooldownDuration は取り直しの間隔の下限。知らない kid を送りつけられるたびに
    // 取りに行くと、外から取得を何度でも起こせてしまうので下限を置く。
    // 鍵の入れ替わりは 6 週に 1 回なので、30 秒あれば十分に追いつく。
    keySet = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
      { cooldownDuration: 30_000, cacheMaxAge: 600_000 },
    );
    keySetDomain = teamDomain;
  }
  return keySet;
}

/**
 * /api/ 以下のすべての経路の手前で動く。
 *
 * functions/ の直下には置かない。根に置くと静的なファイルの前でも動き、
 * JWT が無いことを理由に画面そのものが出なくなる（design/components.md）。
 * 画面を守るのは Cloudflare Access の役目で、ここが守るのは API だけ。
 */
export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const token = context.request.headers.get(ACCESS_HEADER);
  if (!token) {
    return unauthorized("認証の情報がありません");
  }

  try {
    // ヘッダーだけを見て中身を信じない。署名まで確かめないと別人になりすませる。
    await jwtVerify(token, getKeySet(context.env.ACCESS_TEAM_DOMAIN), {
      issuer: `https://${context.env.ACCESS_TEAM_DOMAIN}`,
      audience: context.env.ACCESS_AUD,
    });
  } catch {
    return unauthorized("認証の情報を確かめられませんでした");
  }

  return await context.next();
}

function unauthorized(message: string): Response {
  return Response.json({ message }, { status: 401 });
}
