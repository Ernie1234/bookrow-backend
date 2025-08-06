import type { Request, Response } from "express";
import * as bookService from "../services/bookService";
import Logger from "@/libs/logger";

// Helper function for error handling
const handleError = (res: Response, error: any, status: number = 500) => {
  Logger.error(error);
  res.status(status).json({ message: error.message || "Something went wrong" });
};

// @route   POST /api/books
// @desc    Create a new book
export const createBook = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated." });
    }
    const userId = req.user._id;
    const book = await bookService.createBook(req.body, userId);
    res.status(201).json(book);
  } catch (error) {
    handleError(res, error);
  }
};

// @route   GET /api/books
// @desc    Get all books
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await bookService.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    handleError(res, error);
  }
};

// @route   GET /api/books/:id
// @desc    Get a single book by ID
export const getBookById = async (req: Request, res: Response) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    handleError(res, error, 404);
  }
};

// @route   PUT /api/books/:id
// @desc    Update a book
export const updateBook = async (req: Request, res: Response) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    handleError(res, error, 404);
  }
};

// @route   DELETE /api/books/:id
// @desc    Delete a book
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await bookService.deleteBook(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    handleError(res, error, 404);
  }
};

// @route   PUT /api/books/current
// @desc    Set the user's current book
export const setCurrentBook = async (req: Request, res: Response) => {
  try {
    // Add an explicit check for the user object
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // With this check, the compiler is happy.
    const userId = req.user._id;
    const { bookId } = req.body;
    const user = await bookService.setCurrentBook(userId, bookId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Current book set successfully", user });
  } catch (error) {
    handleError(res, error);
  }
};

// @route   PUT /api/books/:id/progress
// @desc    Update reading/listening progress
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { progress } = req.body;
    const book = await bookService.updateBookProgress(req.params.id, progress);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    handleError(res, error);
  }
};
