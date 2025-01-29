import { IUser } from "../models/UserSchema";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
