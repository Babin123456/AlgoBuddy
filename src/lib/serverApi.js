import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { ApiError, AuthError, ConfigError } from "@/lib/apiErrors";
import { getEnv, validateEnv } from "@/lib/env.js";

let supabaseAdminInstance;

function requireSupabaseUrl() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (!url) throw new ConfigError('Supabase not configured: NEXT_PUBLIC_SUPABASE_URL is missing');
  return url;
}

function requireAnonKey() {
  const key = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!key) throw new ConfigError('Supabase not configured: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  return key;
}

export function getSupabaseAdmin() {
  if (supabaseAdminInstance) return supabaseAdminInstance;
  const url = requireSupabaseUrl();
  const key = getEnv("SUPABASE_SERVICE_KEY");
  if (!key) throw new ConfigError('Supabase not configured: SUPABASE_SERVICE_KEY is missing');
  supabaseAdminInstance = createClient(url, key);
  return supabaseAdminInstance;
}

/**
 * Creates a Supabase server client using the anon key, which respects
 * Row-Level Security policies defined in the database. Use this for all
 * user-data API routes instead of getSupabaseAdmin().
 * Requires a cookie store (from next/headers cookies()) for SSR auth.
 */
export function getSupabaseServerClient(cookieStore) {
  const url = requireSupabaseUrl();
  const anonKey = requireAnonKey();
  const isProduction = getEnv("NODE_ENV") === "production";
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, {
              ...options,
              sameSite: 'strict',
              secure: isProduction,
            });
          } catch {
            // Can happen during GET requests or rendering in Next.js
          }
        });
      },
    },
  });
}

/**
 * Creates a Supabase server client using the anon key from request cookies.
 * Alternative for route handlers that don't have access to next/headers cookies().
 */
export function getSupabaseRequestClient(request) {
  const url = requireSupabaseUrl();
  const anonKey = requireAnonKey();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });
      },
    },
  });
}

/** Anonymous Supabase client for public reads (no session cookies). */
export function getSupabaseAnonClient() {
  const url = requireSupabaseUrl();
  const anonKey = requireAnonKey();
  return createClient(url, anonKey);
}

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export function errorResponse(error) {
  const code = error.code || 'INTERNAL_ERROR';
  const status = error.status || 500;
  const message = error.message || 'Internal server error';
  return Response.json(
    { error: message, code },
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}
