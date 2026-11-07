import { Router } from "express";
import prisma from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"] as const;
const TYPES = ["SELL", "EXCHANGE"] as const;

const sellerSelect = { select: { id: true, name: true, email: true, phone: true } };

// GET /api/products?q=&category=&condition=&minPrice=&maxPrice=&type=
router.get("/", async (req, res) => {
  const { q, category, condition, minPrice, maxPrice, type } = req.query;

  const where: any = { status: "ACTIVE" };
  if (q) where.title = { contains: String(q), mode: "insensitive" };
  if (category) where.categoryId = Number(category);
  if (condition && CONDITIONS.includes(String(condition) as any)) where.condition = String(condition);
  if (type && TYPES.includes(String(type) as any)) where.type = String(type);
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const products = await prisma.product.findMany({
    where,
    include: { seller: sellerSelect, category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ products });
});

// GET /api/products/mine  (must stay above /:id)
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const products = await prisma.product.findMany({
    where: { sellerId: req.user!.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ products });
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid product id" });

  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: sellerSelect, category: true },
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});

// POST /api/products
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { title, description, price, condition, type, categoryId, imageUrl } = req.body;

  if (!title || !description || price === undefined || !condition || !categoryId) {
    return res.status(400).json({
      message: "title, description, price, condition and categoryId are required",
    });
  }
  if (!CONDITIONS.includes(condition)) {
    return res.status(400).json({ message: `condition must be one of ${CONDITIONS.join(", ")}` });
  }
  if (type && !TYPES.includes(type)) {
    return res.status(400).json({ message: `type must be one of ${TYPES.join(", ")}` });
  }
  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: "price must be a valid number" });
  }

  const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
  if (!category) return res.status(400).json({ message: "Invalid category" });

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price: Number(price),
      condition,
      type: type || "SELL",
      imageUrl: imageUrl || null,
      categoryId: Number(categoryId),
      sellerId: req.user!.id,
    },
  });
  res.status(201).json({ product });
});

// Helper: load a product and make sure the logged-in user owns it
async function getOwnedProduct(req: AuthRequest, res: any) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid product id" });
    return null;
  }
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return null;
  }
  if (product.sellerId !== req.user!.id) {
    res.status(403).json({ message: "You can only change your own listings" });
    return null;
  }
  return product;
}

// PUT /api/products/:id  (edit own listing)
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const product = await getOwnedProduct(req, res);
  if (!product) return;

  const { title, description, price, condition, type, categoryId, imageUrl } = req.body;

  if (condition && !CONDITIONS.includes(condition)) {
    return res.status(400).json({ message: `condition must be one of ${CONDITIONS.join(", ")}` });
  }
  if (type && !TYPES.includes(type)) {
    return res.status(400).json({ message: `type must be one of ${TYPES.join(", ")}` });
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(condition && { condition }),
      ...(type && { type }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });
  res.json({ product: updated });
});

// PATCH /api/products/:id/sold  (mark as sold)
router.patch("/:id/sold", requireAuth, async (req: AuthRequest, res) => {
  const product = await getOwnedProduct(req, res);
  if (!product) return;

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { status: "SOLD" },
  });
  res.json({ product: updated });
});

// DELETE /api/products/:id  (delete own listing)
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const product = await getOwnedProduct(req, res);
  if (!product) return;

  await prisma.product.delete({ where: { id: product.id } });
  res.json({ message: "Listing deleted" });
});

export default router;