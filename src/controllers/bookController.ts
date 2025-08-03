import type { NextFunction, Request, Response } from "express";

export const getBooks = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "Books fetched successfully",
    success: true,
  });
};
