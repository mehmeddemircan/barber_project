import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const sessionCookieName = "kok_admin_session";
const sessionDurationSeconds = 12 * 60 * 60;

export type AdminAuthConfig = {
  password: string;
  sessionSecret: string;
};

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 12 || !sessionSecret || sessionSecret.length < 32) return null;
  return { password, sessionSecret };
}

export function verifyAdminPassword(password: string, configuredPassword: string) {
  const submittedHash = createHash("sha256").update(password).digest();
  const configuredHash = createHash("sha256").update(configuredPassword).digest();
  return timingSafeEqual(submittedHash, configuredHash);
}

export function createAdminSessionCookie(config: AdminAuthConfig) {
  const expiresAt = Date.now() + sessionDurationSeconds * 1000;
  const signature = createHmac("sha256", config.sessionSecret).update(String(expiresAt)).digest("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${expiresAt}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionDurationSeconds}${secure}`;
}

export function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}

export function isAdminRequest(request: Request, config: AdminAuthConfig) {
  const prefix = `${sessionCookieName}=`;
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!cookie) return false;

  const parts = cookie.split(".");
  if (parts.length !== 2) return false;
  const [expiresAtValue, signature] = parts;
  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() || expiresAt > Date.now() + sessionDurationSeconds * 1000) return false;

  const expectedSignature = createHmac("sha256", config.sessionSecret).update(String(expiresAt)).digest("base64url");
  const submitted = Buffer.from(signature || "");
  const expected = Buffer.from(expectedSignature);
  return submitted.length === expected.length && timingSafeEqual(submitted, expected);
}
