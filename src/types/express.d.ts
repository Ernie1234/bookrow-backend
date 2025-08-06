// src/types/express.d.ts
import { IUser } from "../models/User"; // Adjust the path as needed

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      user?: User;
    }
  }
}
