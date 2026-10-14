import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config.js";

/**
 * Uploaded audio and art live in an S3-compatible bucket (Garage in
 * development). Nothing here is Garage-specific: any store that speaks S3 and
 * supports presigned GETs will do.
 */
const makeClient = (endpoint: string): S3Client =>
  new S3Client({
    endpoint,
    region: config.s3.region,
    // Path-style URLs (host/bucket/key) need no wildcard DNS for the bucket.
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey,
    },
  });

export const s3 = makeClient(config.s3.endpoint);

// Presigned URLs carry the signer's host, so they are minted against the
// endpoint browsers use. Signing is offline; this client never sends requests.
const publicS3 =
  config.s3.publicEndpoint === config.s3.endpoint ? s3 : makeClient(config.s3.publicEndpoint);

export const bucket = config.s3.bucket;

/** Object keys are unique, so the browser may cache media for as long as it likes. */
export const CACHE_CONTROL_IMMUTABLE = "public, max-age=31536000, immutable";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".opus": "audio/ogg",
  ".flac": "audio/flac",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
};

/** Derived from our validated extension, never from the client's claimed type. */
export const contentTypeFor = (extension: string): string =>
  CONTENT_TYPES[extension.toLowerCase()] ?? "application/octet-stream";

/** Everything belonging to one track sits under one prefix. */
export const trackObjectKey = (trackId: string, kind: "audio" | "art", extension: string): string =>
  `tracks/${trackId}/${kind}${extension.toLowerCase()}`;

const isNotFound = (error: unknown): boolean =>
  error instanceof S3ServiceException &&
  (error.$metadata.httpStatusCode === 404 || error.name === "NotFound" || error.name === "NoSuchBucket");

/**
 * Makes sure the bucket exists and lets the configured origins read from it
 * directly. Garage's compose service already creates the bucket, so the
 * create step mostly matters for other providers.
 */
export const ensureBucket = async (): Promise<void> => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`Created bucket ${bucket}`);
  }

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: config.corsOrigins,
            AllowedMethods: ["GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["Content-Length", "Content-Range", "Accept-Ranges", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
  console.log("\x1b[32m%s\x1b[0m", `Bucket ${bucket} ready at ${config.s3.endpoint}`);
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * A time-limited URL the browser can fetch the object from directly. Signing
 * from the top of the current hour, with a two-hour lifetime, means every
 * request within an hour gets the identical URL (so the browser cache works)
 * while each URL stays valid for at least another hour.
 */
export const presignGet = (key: string): Promise<string> =>
  getSignedUrl(publicS3, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: 2 * 60 * 60,
    signingDate: new Date(Math.floor(Date.now() / HOUR_MS) * HOUR_MS),
  });

export const objectExists = async (key: string): Promise<boolean> => {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (isNotFound(error)) {
      return false;
    }
    throw error;
  }
};

export const putObject = async (key: string, body: Uint8Array, contentType: string): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL_IMMUTABLE,
    }),
  );
};

/**
 * Best-effort removal. Callers have already dropped the database row, and a
 * stranded object is not worth turning their request into a 500.
 */
export const deleteObjects = async (keys: Array<string | null | undefined>): Promise<void> => {
  const objects = keys.filter((key): key is string => Boolean(key)).map((Key) => ({ Key }));
  if (objects.length === 0) {
    return;
  }
  try {
    await s3.send(
      new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects, Quiet: true } }),
    );
  } catch (error) {
    console.warn(`Could not delete ${objects.map((o) => o.Key).join(", ")}:`, error);
  }
};
