// src/routes/bookRoutes.ts
import { Router } from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  setCurrentBook,
  updateProgress,
} from "../controllers/bookController";

// Import the middleware
import { protect } from "@/middlewares/authMiddleware";
import { attachNewTokens } from "@/middlewares/refreshTokenMiddleware";

const router = Router();

// Get all books doesn't need protection if you want it to be public
router.get("/", getBooks);

// All other routes for creating, updating, and deleting books should be protected
router.post("/", protect, attachNewTokens, createBook);
router.put("/current", protect, attachNewTokens, setCurrentBook);
router.put("/:id", protect, attachNewTokens, updateBook);
router.put("/:id/progress", protect, attachNewTokens, updateProgress);
router.delete("/:id", protect, attachNewTokens, deleteBook);

export default router;
