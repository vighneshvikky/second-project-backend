import 'express';

declare module 'express' {
  interface Request {
    files?: {
      [fieldname: string]: Express.Multer.File[]; // or Express.MulterS3.File[]
    };
  }
}
