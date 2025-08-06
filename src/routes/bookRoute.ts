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
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Get all books doesn't need protection if you want it to be public
router.get("/", getBooks);

// All other routes for creating, updating, and deleting books should be protected
router.post("/", protect, createBook);
router.put("/current", protect, setCurrentBook);
router.put("/:id", protect, updateBook);
router.put("/:id/progress", protect, updateProgress);
router.delete("/:id", protect, deleteBook);

export default router;
