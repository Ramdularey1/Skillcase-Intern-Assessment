import { loginUser, registerUser } from "../services/authService.js";

export async function register(req, res) {
  const result = await registerUser(req.validated.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await loginUser(req.validated.body);
  res.json(result);
}

export async function me(req, res) {
  res.json({ user: req.user });
}
