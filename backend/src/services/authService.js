import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const publicUserFields = "id, name, email, created_at";

export async function registerUser({ name, email, password }) {
  const existing = await query("select id from app_users where email = $1", [email]);

  if (existing.rows[0]) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    `insert into app_users (name, email, password_hash)
     values ($1, $2, $3)
     returning ${publicUserFields}`,
    [name, email.toLowerCase(), passwordHash]
  );

  const user = rows[0];
  return { user, token: signToken(user) };
}

export async function loginUser({ email, password }) {
  const { rows } = await query("select * from app_users where email = $1", [
    email.toLowerCase()
  ]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError("Invalid email or password", 401);
  }

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at
  };

  return { user: publicUser, token: signToken(publicUser) };
}
