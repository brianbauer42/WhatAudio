import passport from "passport";
import passportLocal from "passport-local";
import { User } from "../models/User.js";

const LocalStrategy = passportLocal.Strategy;

// 1-32 characters long, containing upper and lowercase letters, numbers, and
// underscores. Also keeps display names safe to use as an upload directory name.
const VALID_DISPLAY_NAME = /^[a-zA-Z0-9_]{1,32}$/;

export const registerStrategies = (): void => {
  passport.serializeUser<string>((user, done) => {
    done(null, String(user._id));
  });

  passport.deserializeUser<string>(async (id, done) => {
    try {
      done(null, await User.findById(id));
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

          const existing = await User.findOne({
            $or: [{ email }, { displayName }],
          });
          if (existing?.displayName === displayName) {
            done(null, false, { message: "User name already taken." });
            return;
          }
          if (existing) {
            done(null, false, { message: "This email already has an account." });
            return;
          }

          // The pre-save hook hashes this before it reaches the database.
          const user = await User.create({ email, displayName, password });
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
          const user = await User.findOne({ email });
          if (!user) {
            done(null, false, { message: "Email not found!" });
            return;
          }
          if (!(await user.validPassword(password))) {
            done(null, false, { message: "Invalid password." });
            return;
          }
          done(null, user, { message: `Welcome back, ${user.displayName}!` });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};
