import GoogleStrategy from "passport-google-oidc";
import { prisma } from "../../app.mjs";

const googleOptions = {
  clientID: process.env["GOOGLE_CLIENT_ID"],
  clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
  callbackURL: "/oauth/google/callback",
  scope: ["profile"],
};

const googleVerify = async (req, profile, done) => {
  // Find the user in the oauthUser table.
  try {
    let user = await prisma.blogOauthUser.findUnique({
      where: {
        [provider_subject]: { provider: "google", subject: profile.id },
      },
      include: { BlogUser: true },
      select: {
        BlogUser: { select: { name: true, isAdmin: true } },
      },
    });

    // If the user exists in the database:
    if (user) {
      // if the user is not logged in, or the loggin in user is the same.
      if (!req.user || req.user.name === user.BlogUser.name)
        return done(null, user.BlogUser);
      return done(new Error("This account has bound to other user."), null);
    }
    // If the user does not exist in the database:

    // If there is a logged in user whose token is expired, we cannot deal with it .
    if (!req.user && req.loginMsg === "TokenExpiredError")
      return done(new Error("Token expired, please login again."), null);

    // If there is a logged in user, we bind the user to the oauthUser.
    if (req.user) {
      await prisma.blogOauthUser.create({
        data: {
          provider: "google",
          subject: profile.id,
          BlogUser: { connect: { name: req.user.name } },
        },
      });
      return done(null, req.user);
    }

    // If there is no logged in user, we create a new user.
    const newUser = await prisma.blogUser.create({
      data: {
        name: profile.displayName,
        blogOauthUser: { create: { provider: "google", subject: profile.id } },
      },
      select: { name: true, isAdmin: true },
    });
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
};

/**
 * The GoogleStrategy deals with the Google OAuth2.0 authentication.
 * Apply it in app.js.
 */
const googleStrategy = new GoogleStrategy(googleOptions, googleVerify);

/**
 * The googleAuth middleware authenticates the user with Google OAuth2.0.
 * If the user is authenticated, the user object is stored in req.user.
 * If the user is not authenticated, will return a 401 status code.
 */
const googleAuth = async (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err) return res.status(401).json({ message: err.message });
    if (!user) return res.status(401).json({ message: "User authentication failed." });
    req.user = user;
    next();
  })(req, res, next);
};

export { googleStrategy, googleAuth };
