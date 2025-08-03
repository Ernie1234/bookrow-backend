import type { NextFunction, Request, Response } from "express";

export const register = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "Hurray!! we create our first server on bun js",
    success: true,
  });
};
