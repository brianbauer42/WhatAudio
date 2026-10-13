import fs from "node:fs/promises";
import { config } from "./config.js";

export const ensureUploadDirExists = async (): Promise<void> => {
  await fs.mkdir(config.uploadDir, { recursive: true });
  console.log("Upload directory ready:", config.uploadDir);
};
