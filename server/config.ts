import "dotenv/config";
import path from "node:path";

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

export const config = {
  isProduction,
  port: num("PORT", 8080),
  host: str("HOST", "localhost"),
  // A missing secret is fatal in production but must not stand in the way of a
  // first `npm run dev`.
  sessionSecret: str("SESSION_SECRET", isProduction ? undefined : "insecure-development-secret"),
  mongoUri: str("MONGO_URI", "mongodb://127.0.0.1:27017/WhatAudio"),
  contactPageEmail: str("CONTACT_EMAIL", ""),
  uploadDir: path.resolve(str("UPLOAD_DIR", "./uploads")),
  // Session cookies are HTTPS-only in production. Turn this off if you
  // terminate TLS elsewhere and genuinely serve the app over plain HTTP.
  cookieSecure: bool("COOKIE_SECURE", isProduction),
  allowRegistrations: bool("ALLOW_REGISTRATIONS", true),
  openRegistrations: bool("OPEN_REGISTRATIONS", false),
  maxUploadBytes: num("MAX_UPLOAD_MB", 100) * 1024 * 1024,
};
