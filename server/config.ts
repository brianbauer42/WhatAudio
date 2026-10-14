import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const str = (name: string, fallback?: string): string => {
  const value = process.env[name]?.trim();
  if (value) {
    return value;
  }
  if (fallback === undefined) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return fallback;
};

const num = (name: string, fallback: number): number => {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
  }
  return value;
};

const bool = (name: string, fallback: boolean): boolean => {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return fallback;
  }
  return raw === "true" || raw === "1" || raw === "yes";
};

const list = (name: string, fallback: string[]): string[] => {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Development-only credentials. They match compose.yaml and docker/garage.toml
// and are deliberately unusable in production (see the `isProduction` checks).
const DEV_DATABASE_URL = "postgres://whataudio:whataudio@127.0.0.1:5432/whataudio";
const DEV_S3_ACCESS_KEY = "GK0123456789abcdef01234567";
const DEV_S3_SECRET_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export const config = {
  isProduction,
  port: num("PORT", 8080),
  host: str("HOST", "localhost"),
  // A missing secret is fatal in production but must not stand in the way of a
  // first `pnpm run dev`.
  sessionSecret: str("SESSION_SECRET", isProduction ? undefined : "insecure-development-secret"),
  // Postgres connection string. Required in production so a forgotten .env can
  // never point a real deployment at the throwaway compose database.
  databaseUrl: str("DATABASE_URL", isProduction ? undefined : DEV_DATABASE_URL),
  // Any S3-compatible store works: Garage locally, Garage or R2/B2 in production.
  s3: {
    // Presigned media links embed publicEndpoint below, not this one.
    endpoint: str("S3_ENDPOINT", "http://localhost:3900"),
    // Where browsers reach the store, when that differs from where the server
    // does (e.g. inside Docker, the server talks to http://garage:3900).
    publicEndpoint: str("S3_PUBLIC_ENDPOINT", process.env.S3_ENDPOINT?.trim() || "http://localhost:3900"),
    region: str("S3_REGION", "garage"),
    bucket: str("S3_BUCKET", "whataudio"),
    accessKey: str("S3_ACCESS_KEY", isProduction ? undefined : DEV_S3_ACCESS_KEY),
    secretKey: str("S3_SECRET_KEY", isProduction ? undefined : DEV_S3_SECRET_KEY),
  },
  // Origins allowed to read media straight from the bucket. The ring paints
  // album art into WebGL textures, which only works when the store answers
  // with CORS headers for the page's origin.
  corsOrigins: list("CORS_ORIGINS", ["http://localhost:3000", "http://localhost:8080"]),
  contactPageEmail: str("CONTACT_EMAIL", ""),
  // Session cookies are HTTPS-only in production. Turn this off if you
  // terminate TLS elsewhere and genuinely serve the app over plain HTTP.
  cookieSecure: bool("COOKIE_SECURE", isProduction),
  // Anyone can sign up while this is on, so it defaults to off in production.
  allowRegistrations: bool("ALLOW_REGISTRATIONS", !isProduction),
  maxUploadBytes: num("MAX_UPLOAD_MB", 100) * 1024 * 1024,
};
