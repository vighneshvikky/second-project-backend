import { Request } from 'express';
import { Multer } from 'multer';

export function handleS3Upload(
  upload: ReturnType<Multer['fields']>,
  req: Request,
): Promise<{ body: any; files: Record<string, Express.MulterS3.File[]> }> {
  return new Promise((resolve, reject) => {
    upload(req, {} as any, (err: any) => {
      if (err) return reject(err);

      resolve({
        body: req.body,
        files: req.files as Record<string, Express.MulterS3.File[]>,
      });
    });
  });
}
