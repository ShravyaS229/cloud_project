import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// JWT_SECRET comes from backend/.env (REPLACE it with your own long random text)
function makeToken(id: number, role: string) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

const publicUser = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      phone: phone || null,
      role: "STUDENT",
    },
  });

  res.status(201).json({ token: makeToken(user.id, user.role), user: publicUser(user) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "Your account has been deactivated" });
  }

  res.json({ token: makeToken(user.id, user.role), user: publicUser(user) });
});

// GET /api/auth/me  (protected)
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.isActive) return res.status(401).json({ message: "Account not available" });
  res.json({ user: publicUser(user) });
});

export default router;
