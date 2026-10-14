import passport from "passport";
import passportLocal from "passport-local";
import {
  checkCredentials,
  createUser,
  findSignupConflict,
  findUserById,
} from "../db/users.js";

const LocalStrategy = passportLocal.Strategy;

// 1-32 characters long, containing upper and lowercase letters, numbers, and
// underscores.
const VALID_DISPLAY_NAME = /^[a-zA-Z0-9_]{1,32}$/;

export const registerStrategies = (): void => {
  passport.serializeUser<string>((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser<string>(async (id, done) => {
    try {
      done(null, (await findUserById(id)) ?? false);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "signup[email]",
        passwordField: "signup[password]",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const signup = req.body?.signup ?? {};
          const displayName = String(signup.name ?? "");

          if (!VALID_DISPLAY_NAME.test(displayName)) {
            done(null, false, {
              message:
                "Names may contain only letters, numbers, or _ and must be under 33 characters",
            });
            return;
          }
          if (!password) {
            done(null, false, { message: "A password is required." });
            return;
          }
          if (password !== signup.verify) {
            done(null, false, { message: "The passwords don't match!" });
            return;
          }

          const conflict = await findSignupConflict(email, displayName);
          if (conflict === "displayName") {
            done(null, false, { message: "User name already taken." });
            return;
          }
          if (conflict === "email") {
            done(null, false, { message: "This email already has an account." });
            return;
          }

          // createUser hashes the password before it reaches the database. A
          // race with another signup surfaces as a unique violation, which the
          // error handler turns into a 409.
          const user = await createUser({ email, displayName, password });
          done(null, user, { message: `Welcome, ${user.displayName}!` });
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "login[email]",
        passwordField: "login[password]",
      },
      async (email, password, done) => {
        try {
          const result = await checkCredentials(email, password);
          if (!result.user) {
            done(null, false, {
              message: result.failure === "email" ? "Email not found!" : "Invalid password.",
            });
            return;
          }
          done(null, result.user, { message: `Welcome back, ${result.user.displayName}!` });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};
