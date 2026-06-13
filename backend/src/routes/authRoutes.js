import { Router } from "express";
import { z } from "zod";
import { login, me, register } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Email must be valid"),
    password: z.string().min(6, "Password must be at least 6 characters")
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email must be valid"),
    password: z.string().min(1, "Password is required")
  })
});

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(me));

export default router;
