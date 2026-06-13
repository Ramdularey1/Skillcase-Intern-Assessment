import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set("etag", false);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  const { query } = await import("./config/db.js");
  const { rows } = await query("select now() as checked_at");
  res.json({ status: "ok", checked_at: rows[0].checked_at });
});

app.use("/auth", authRoutes);
app.use("/videos", videoRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
