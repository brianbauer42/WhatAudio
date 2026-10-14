import type { User as AppUser } from "../db/users.js";

// Teach Express (and therefore passport and multer) about our own additions.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends AppUser {}

    interface Request {
      /** Set by `assignTrackId` before an upload; keys the files and the row. */
      trackId?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Multer {
      interface File {
        /** Object key in the bucket, set by the storage engine. */
        key?: string;
      }
    }
  }
}

export {};
