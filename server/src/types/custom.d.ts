// types/express.d.ts

import { IUser } from "../models/UserSchema"; // Adjust the path as needed
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Add the `user` property to the Request interface
    }
  }
}
