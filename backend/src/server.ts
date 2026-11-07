import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./db";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Campus Marketplace API is running");
});

app.get("/api/health", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ status: "ok", categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Database not reachable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));