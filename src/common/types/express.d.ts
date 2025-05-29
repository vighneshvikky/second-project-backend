import 'express';

declare module 'express' {
  interface Request {
    files?: {
      [fieldname: string]: Express.Multer.File[]; 
    };
  }
}
