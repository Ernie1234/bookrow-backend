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

const router = Router();

router.route("/").post(createBook).get(getBooks);

router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);

router.route("/current").put(setCurrentBook);

router.route("/:id/progress").put(updateProgress);

export default router;
