import crypto from "crypto";

export const CSRF_COOKIE_NAME = "csrf-token";
export const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString("hex");

export function generateCsrfToken() {
  const random = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString(36);
  const hmac = crypto.createHmac("sha256", CSRF_SECRET).update(`${random}:${timestamp}`).digest("hex");
  return `${random}:${timestamp}:${hmac}`;
}

export function validateCsrf(request) {
  const cookieToken = request.cookies?.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers?.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  if (cookieToken !== headerToken) {
    return false;
  }

  const parts = cookieToken.split(":");
  if (parts.length !== 3) {
    return false;
  }

  const [random, timestamp, hmac] = parts;
  const expectedHmac = crypto.createHmac("sha256", CSRF_SECRET).update(`${random}:${timestamp}`).digest("hex");

  if (hmac !== expectedHmac) {
    return false;
  }

  const tokenAge = Date.now() - parseInt(timestamp, 36);
  if (tokenAge > 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}

export function setCsrfCookie(response) {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return token;
}

const TRUSTED_ORIGINS = (() => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://algobuddy.me",
    "https://www.algobuddy.me",
    "https://algobuddy.vercel.app",
  ]);
  if (appUrl) origins.add(appUrl.replace(/\/+$/, ""));
  return origins;
})();

export function validateCsrfOrigin(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer || "";
  const normalized = source.replace(/\/+$/, "");
  return TRUSTED_ORIGINS.has(normalized);
}

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isStateChangingMethod(method) {
  return STATE_CHANGING_METHODS.has(method);
}

export function isApiRoute(pathname) {
  return pathname.startsWith("/api/");
}
