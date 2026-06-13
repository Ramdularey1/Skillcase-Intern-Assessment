import dotenv from "dotenv";

dotenv.config();

const defaultClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://skillcase-intern-assessment.vercel.app"
];

const configuredClientOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return databaseUrl;
  }

  try {
    const url = new URL(databaseUrl);
    if (url.password) {
      url.password = decodeURIComponent(url.password);
    }
    return url.toString();
  } catch (_error) {
    return databaseUrl;
  }
}

export const env = {
  port: process.env.PORT || 5001,
  databaseUrl: normalizeDatabaseUrl(process.env.DATABASE_URL),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigins: [...new Set([...defaultClientOrigins, ...configuredClientOrigins])]
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}
