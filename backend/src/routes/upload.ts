import "dotenv/config";
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../middleware/auth";

// These 3 values come from backend/.env
// REPLACE them with your Cloudinary Cloud name, API Key and API Secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const router = Router();

// POST /api/upload   (form-data field name: "image")
router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file received" });

  const stream = cloudinary.uploader.upload_stream(
    { folder: "campus-marketplace" },
    (error, result) => {
      if (error || !result) {
        console.error(error);
        return res.status(500).json({ message: "Image upload failed. Check your Cloudinary keys." });
      }
      res.status(201).json({ imageUrl: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
});

// Handles file-too-large and wrong-file-type errors
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({ message: err.message });
});

export default router;
