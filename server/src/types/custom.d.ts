import { IUser } from "../models/UserSchema";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
