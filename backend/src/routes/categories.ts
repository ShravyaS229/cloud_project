import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
});

export default router;