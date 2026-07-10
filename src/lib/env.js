const ENV_VARS = {
  SUPABASE: {
    NEXT_PUBLIC_SUPABASE_URL: { required: true, type: 'url' },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: { required: true, type: 'string' },
    SUPABASE_SERVICE_KEY: { required: false, type: 'string' },
  },
  TURNSTILE: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: { required: false, type: 'string' },
    TURNSTILE_SECRET_KEY: { required: false, type: 'string' },
  },
  EMAIL: {
    EMAIL_USER: { required: false, type: 'string' },
    EMAIL_PASSWORD: { required: false, type: 'string' },
  },
  GEMINI: {
    GEMINI_API_KEY: { required: false, type: 'string' },
  },
  RATE_LIMIT: {
    UPSTASH_REDIS_REST_URL: { required: false, type: 'url' },
    UPSTASH_REDIS_REST_TOKEN: { required: false, type: 'string' },
  },
  CSRF: {
    CSRF_SECRET: { required: false, type: 'string' },
  },
};

const ENV_WARNINGS = {
  NEXT_PUBLIC_SUPABASE_URL: 'Missing NEXT_PUBLIC_SUPABASE_URL. Copy .env.example to .env.local and add your Supabase project URL.',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your Supabase anon key.',
  TURNSTILE_SECRET_KEY: 'TURNSTILE_SECRET_KEY is not configured. CAPTCHA verification will fail in production.',
  GEMINI_API_KEY: 'GEMINI_API_KEY is not set. AI assistant features will be unavailable.',
  CSRF_SECRET: 'CSRF_SECRET is not set. Using a development-only fallback. Set it in .env.local for production.',
};

const WARNED_KEYS = new Set();

function getEnvVar(key) {
  return process.env[key];
}

function isValidUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateType(value, type) {
  if (!value) return false;
  switch (type) {
    case 'url':
      return isValidUrl(value);
    case 'string':
      return typeof value === 'string' && value.length > 0;
    default:
      return true;
  }
}

export function validateEnv(group) {
  const vars = ENV_VARS[group];
  if (!vars) return { valid: true, missing: [] };

  const missing = [];
  for (const [key, config] of Object.entries(vars)) {
    const value = getEnvVar(key);
    if (config.required && !validateType(value, config.type)) {
      missing.push(key);
      if (!WARNED_KEYS.has(key) && process.env.NODE_ENV !== 'production') {
        WARNED_KEYS.add(key);
        const warning = ENV_WARNINGS[key] || `Environment variable ${key} is missing or invalid.`;
        console.warn(`[env] ${warning}`);
      }
    }
  }

  return { valid: missing.length === 0, missing };
}

export function getEnv(key, defaultValue = null) {
  const value = getEnvVar(key);
  if (value && value !== 'undefined' && value !== '') return value;
  return defaultValue;
}

export function isEnvConfigured(key) {
  const value = getEnvVar(key);
  return !!value && value !== 'undefined' && !value.startsWith('your-');
}

export function isFeatureEnabled(key) {
  return getEnv(key, 'false') === 'true';
}

export function validateAllRequired() {
  const results = {};
  for (const group of Object.keys(ENV_VARS)) {
    results[group] = validateEnv(group);
  }
  return results;
}
