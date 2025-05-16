import 'express';

declare global {
  namespace Express {
    namespace MulterS3 {
      interface File extends Express.Multer.File {
        /** The location (URL) of the uploaded file in S3 */
        location: string;
        /** The ETag returned by S3 */
        etag: string;
        /** Bucket name */
        bucket: string;
        /** Key name */
        key: string;
        /** ACL (like public-read) */
        acl: string;
        /** Content Type */
        contentType: string;
        /** Storage class */
        storageClass: string;
        /** Metadata */
        metadata: any;
        /** Server side encryption method */
        serverSideEncryption?: string;
      }
    }
  }
}
