import { prisma } from "../../app.mjs";
import passport from "passport";

/**
 * Generate the options for the OAuth strategy.
 * 
 * @param {string} provider The provider name, "github" or "google".
 * @param {string} scope The scope for the OAuth.
 * @returns The object containing the options for the OAuth strategy.
 */
const generateOptions = (provider, scope) => {
  return {
    clientID: process.env[`${provider.toUpperCase()}_CLIENT_ID`],
    clientSecret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
    callbackURL: `/api/user/oauth/${provider}/callback`,
    scope,
    session: false,
    passReqToCallback: true,
  };
};

/**
 * Generate the verify function for the OAuth strategy.
 * 
 * @param {string} provider The provider name, "github" or "google".
 * @returns The verify function.
 */
const generateVerifyFunc = (provider) => async (req, accessToken, refreshToken, profile, done) => {
  // Find the user in the oauthUser table.
  try {
    let user = await prisma.blogOauthUser.findFirst({
      where: {
        provider: provider,
        subject: profile.id,
        user: { isDeleted: false },
      },
      select: {
        user: { select: { id: true, username: true, isAdmin: true } },
      },
    });

    // If the user exists in the database:
    if (user) {
      // if the user is not logged in, or the loggin in user is the same.
      if (!req.user || req.user.id === user.user.id)
        return done(null, user.user);
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
          provider,
          subject: profile.id,
          user: { connect: { id: req.user.id } },
        },
      });
      return done(null, req.user);
    }

    // If there is no logged in user, we create a new user.
    const newUser = await prisma.blogUser.create({
      data: {
        username: profile.displayName || profile.username,
        oauths: { create: { provider: provider, subject: profile.id } },
      },
      select: { id: true, username: true, isAdmin: true },
    });
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
};

/**
 * The oauthAuth middleware authenticates the user with Github/Google OAuth2.0.
 * If the user is authenticated, the user object is stored in req.user.
 * If the user is not authenticated, will return a 401 status code.
 * 
 * @param {string} provider The provider name, "github" or "google".
 * @returns The middleware function.
 */
const generateOauthAuthMidware = (provider) => async (req, res, next) => {
  passport.authenticate(provider, async (err, user) => {
    if (err) return res.status(401).json({ message: err.message });
    if (!user)
      return res.status(401).json({ message: "User authentication failed." });
    req.user = user;
    next();
  })(req, res, next);
};

export { generateOptions, generateVerifyFunc, generateOauthAuthMidware };
