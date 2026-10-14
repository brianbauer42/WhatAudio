import { HttpError } from "./httpError.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Route parameters reach Postgres as `uuid` values. Anything else would
 * surface as a 500 from the driver, so reject it up front as a 400 instead.
 */
export const parseId = (value: unknown): string => {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new HttpError(400, "Invalid id");
  }
  return value.toLowerCase();
};
