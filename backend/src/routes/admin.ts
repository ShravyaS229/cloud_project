import { Router } from "express";
import prisma from "../db";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Every route in this file needs a logged-in admin
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  const [totalUsers, activeListings, soldProducts] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "SOLD" } }),
  ]);
  res.json({ totalUsers, activeListings, soldProducts });
});

// GET /api/admin/users
router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

// PATCH /api/admin/users/:id/status   body: { "isActive": true | false }
router.patch("/users/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { isActive } = req.body;

  if (!Number.isInteger(id) || typeof isActive !== "boolean") {
    return res.status(400).json({ message: "Valid user id and isActive (true/false) required" });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "ADMIN") {
    return res.status(403).json({ message: "Admin accounts cannot be deactivated" });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
  res.json({ user: updated });
});

// GET /api/admin/products   (all listings, any status)
router.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({
    include: {
      seller: { select: { id: true, name: true, email: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ products });
});

// DELETE /api/admin/products/:id   (remove any listing)
router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid product id" });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: "Product not found" });

  await prisma.product.delete({ where: { id } });
  res.json({ message: "Listing removed by admin" });
});

export default router;
