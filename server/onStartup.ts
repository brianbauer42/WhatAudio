import fs from "node:fs/promises";
import path from "node:path";
import { Invite } from "./models/Invite.js";
import { User } from "./models/User.js";
import { config } from "./config.js";
import { generateInviteCode } from "./controllers/inviteControl.js";

const REGISTRATION_CODE_FILE = path.resolve("REGISTRATION_CODE.txt");

export const ensureUploadDirExists = async (): Promise<void> => {
  await fs.mkdir(config.uploadDir, { recursive: true });
  console.log("Upload directory ready:", config.uploadDir);
};

/**
 * On a fresh database there is nobody to hand out invites, so mint one and
 * leave it where the operator will find it.
 */
export const inviteFirstUser = async (): Promise<void> => {
  if ((await User.estimatedDocumentCount()) > 0 || (await Invite.estimatedDocumentCount()) > 0) {
    return;
  }

  const invite = await Invite.create({
    note: "Genesis Invite",
    code: generateInviteCode(),
  });

  console.log(
    "\x1b[36m%s\x1b[0m",
    `No users were found in the database. Use this code to create your first account: ${invite.code}`,
  );

  try {
    await fs.writeFile(REGISTRATION_CODE_FILE, `First invite code: ${invite.code}\n`);
    console.log("\x1b[36m%s\x1b[0m", `Saving a copy at ${REGISTRATION_CODE_FILE}`);
  } catch (error) {
    console.warn(`Could not write ${REGISTRATION_CODE_FILE}:`, error);
  }
};
