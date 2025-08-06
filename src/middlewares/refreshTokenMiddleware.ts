import type { Request, Response, NextFunction } from "express";

export const attachNewTokens = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.locals.newAccessToken) {
    res.set("Access-Control-Expose-Headers", "New-Access-Token");
    res.set("New-Access-Token", res.locals.newAccessToken);
  }
  next();
};
