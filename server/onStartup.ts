import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Invite } from "./models/Invite";
import { User } from "./models/User";
import { config } from "./config";

const createAndSaveFirstInvite = () => {
  const newCode = new Invite();
  newCode.note = "Genesis Invite";
  newCode.code = crypto.randomBytes(16).toString("hex");
  const firstInvite = newCode.code;
  newCode.save((err: Error) => {
    if (err) {
      console.log(err);
    }
    return;
  });
  return firstInvite;
};

export const ensureUploadDirExists = () => {
  const path = config.uploadDir;
  fs.mkdir(path, 0o744, (err: NodeJS.ErrnoException) => {
    if (err) {
      if (err.code == "EEXIST") {
        console.log("Specified upload directory exists: ", path);
      } else {
        console.log("Error creating upload directory: ", path);
        console.log(err);
      }
    } else {
      console.log("Created upload directory: ", path);
    }
  });
};

export const inviteFirstUser = () => {
  User.findOne({}).exec(function(err, result) {
    if (err) {
      console.log(err);
    }
    if (result === null) {
      Invite.findOne({}).exec(function(err, result) {
        if (err) {
          console.log(err);
        }
        if (result === null) {
          const firstInvite = createAndSaveFirstInvite();
          fs.writeFile(
            path.resolve(__dirname, "..") + "/REGISTRATION_CODE.txt",
            "First invite code: " + firstInvite,
            function(err) {
              if (err) {
                return console.log(err);
              }
              console.log(
                "\x1b[36m%s\x1b[0m",
                "No users were found in the database. Use this code to create your first account: " +
                  firstInvite
              );
              console.log(
                "\x1b[36m%s\x1b[0m",
                "Saving a copy at " +
                  path.resolve(__dirname, "..") +
                  "/REGISTRATION_CODE.txt"
              );
            }
          );
        }
      });
    }
  });
};
