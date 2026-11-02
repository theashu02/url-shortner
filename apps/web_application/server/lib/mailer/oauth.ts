import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { MailProvider } from "@/server/models/mailConnection";

export type OAuthProvider = Exclude<MailProvider, "smtp">;

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

function cleanBase(v: string | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim().replace(/\/$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function getBaseUrl(): string {
  return (
    cleanBase(process.env.MAILER_PUBLIC_BASE_URL) ||
    cleanBase(process.env.NEXTAUTH_URL) ||
    "http://localhost:3000"
  );
}

/**
 * Prefers the host the browser is actually using (localhost vs ngrok),
 * but only when it matches a known base. Otherwise falls back to env config.
 * Google/Microsoft require the redirect URI to be pre-registered, so the
 * value returned here is always one the developer allowlisted.
 */
export function getRequestBaseUrl(request: Request): string {
  try {
    const origin = new URL(request.url).origin.replace(/\/$/, "");
    const allowed = [
      cleanBase(process.env.MAILER_PUBLIC_BASE_URL),
      cleanBase(process.env.NEXTAUTH_URL),
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter((v): v is string => v !== null);
    if (allowed.includes(origin)) return origin;
  } catch {
    // fall through to env default
  }
  return getBaseUrl();
}

export function getProviderConfig(provider: OAuthProvider): ProviderConfig {
  if (provider === "gmail") {
    return {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      clientId: required("GOOGLE_CLIENT_ID"),
      clientSecret: required("GOOGLE_CLIENT_SECRET"),
    };
  }
  return {
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["Mail.Send", "offline_access", "User.Read"],
    clientId: required("MICROSOFT_CLIENT_ID"),
    clientSecret: required("MICROSOFT_CLIENT_SECRET"),
  };
}

export function getRedirectUri(provider: OAuthProvider, base?: string): string {
  return `${base ?? getBaseUrl()}/api/mailer/${provider}/callback`;
}

export function buildAuthUrl(provider: OAuthProvider, state: string, base?: string): string {
  const cfg = getProviderConfig(provider);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: getRedirectUri(provider, base),
    response_type: "code",
    scope: cfg.scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  if (provider === "outlook") {
    params.delete("access_type");
    params.delete("include_granted_scopes");
    params.set("response_mode", "query");
  }
  return `${cfg.authorizeUrl}?${params.toString()}`;
}

export interface OAuthState {
  userId: string;
  nonce: string;
  exp: number;
}

function b64urlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function b64urlDecode<T>(s: string): T {
  return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
}

export function signState(userId: string): string {
  const secret = required("NEXTAUTH_SECRET");
  const payload = b64urlEncode({
    userId,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000,
  } satisfies OAuthState);
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyState(state: string): OAuthState {
  const secret = required("NEXTAUTH_SECRET");
  const [payload, sig] = state.split(".");
  if (!payload || !sig) throw new Error("Invalid OAuth state.");
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid OAuth state signature.");
  }
  const decoded = b64urlDecode<OAuthState>(payload);
  if (!decoded.userId || decoded.exp < Date.now()) {
    throw new Error("Expired OAuth state. Please try connecting again.");
  }
  return decoded;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  scopes: string[];
}

async function tokenRequest(provider: OAuthProvider, params: Record<string, string>): Promise<TokenSet> {
  const cfg = getProviderConfig(provider);
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Token exchange failed (${res.status}). ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string | null;
    expires_in?: number;
    scope?: string;
  };
  if (!data.access_token) throw new Error("Token endpoint returned no access token.");
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresIn: data.expires_in ?? 3600,
    scopes: data.scope ? data.scope.split(" ") : cfg.scopes,
  };
}

export function exchangeCode(provider: OAuthProvider, code: string, base?: string): Promise<TokenSet> {
  return tokenRequest(provider, {
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(provider, base),
  });
}

export function refreshAccessToken(provider: OAuthProvider, refreshToken: string): Promise<TokenSet> {
  return tokenRequest(provider, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function fetchAccountEmail(
  provider: OAuthProvider,
  accessToken: string
): Promise<string> {
  const url =
    provider === "gmail"
      ? "https://www.googleapis.com/oauth2/v2/userinfo"
      : "https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Could not read the connected mailbox address.");
  const data = (await res.json()) as {
    email?: string;
    mail?: string;
    userPrincipalName?: string;
  };
  const email = data.email ?? data.mail ?? data.userPrincipalName;
  if (!email) throw new Error("Provider did not return a mailbox address.");
  return email.toLowerCase();
}

export async function revokeProviderToken(
  provider: OAuthProvider,
  accessToken: string
): Promise<void> {
  try {
    if (provider === "gmail") {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`,
        { method: "POST" }
      );
    }
    // Microsoft has no user-token revoke endpoint; deleting locally is sufficient.
  } catch {
    // Revocation is best-effort; local delete still proceeds.
  }
}
