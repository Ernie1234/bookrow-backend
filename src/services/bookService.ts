import UserModel from "@/models/User";
import BookModel from "../models/bookModel";
import type { IBook } from "@/models/bookModel";
import { Types } from "mongoose";

export const createBook = async (
  bookData: Partial<IBook>,
  userId: Types.ObjectId
): Promise<IBook> => {
  const newBook = new BookModel({
    ...bookData,
    addedBy: userId,
  });
  await newBook.save();
  return newBook;
};

export const getAllBooks = async (): Promise<IBook[]> => {
  return await BookModel.find().populate("addedBy", "username");
};

export const getBookById = async (id: string): Promise<IBook | null> => {
  return await BookModel.findById(id).populate("addedBy", "username");
};

export const updateBook = async (
  id: string,
  bookData: Partial<IBook>
): Promise<IBook | null> => {
  return await BookModel.findByIdAndUpdate(id, bookData, { new: true });
};

export const deleteBook = async (id: string): Promise<IBook | null> => {
  return await BookModel.findByIdAndDelete(id);
};

export const setCurrentBook = async (
  userId: Types.ObjectId,
  bookId: string
): Promise<any> => {
  return await UserModel.findByIdAndUpdate(
    userId,
    { currentBook: bookId },
    { new: true }
  );
};

export const addReadingPartner = async (
  bookId: string,
  partnerId: string
): Promise<IBook | null> => {
  const book = await BookModel.findById(bookId);
  if (!book) throw new Error("Book not found");
  if (!book.readingPartners) {
    book.readingPartners = [];
  }
  book.readingPartners.push(new Types.ObjectId(partnerId));
  return await book.save();
};

export const updateBookProgress = async (
  bookId: string,
  progress: number
): Promise<IBook | null> => {
  return await BookModel.findByIdAndUpdate(bookId, { progress }, { new: true });
};
