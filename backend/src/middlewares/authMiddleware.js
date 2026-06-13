import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError("Authentication token is required", 401);
    }

    const payload = verifyToken(token);
    const { rows } = await query(
      "select id, name, email, created_at from app_users where id = $1",
      [payload.id]
    );

    if (!rows[0]) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError("Invalid or expired token", 401));
  }
}


export async function optionalAuthMiddleware(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    const { rows } = await query(
      "select id, name, email, created_at from app_users where id = $1",
      [payload.id]
    );

    if (rows[0]) {
      req.user = rows[0];
    }

    next();
  } catch {
    next();
  }
}
