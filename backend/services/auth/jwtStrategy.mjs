import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { prisma } from "../../app.mjs";

const jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  // extract the JWT token from the header.
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// Verify the JWT token
const jwtVerify = async (payload, done) => {
  try {
    const username = payload.userName; // extract the username from the payload
    const user = await prisma.blogUser.findUnique({
      where: { username },
      select: { username: true, isAdmin: true },
    });
    if (user) return done(null, user); // user exists
    return done(null, false); // user not found
  } catch (error) {
    done(error, false); // error
  }
};

/**
 * The JWT strategy for passport, should be applied in app.js.
 */
const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

/**
 * Middleware to extract authenticated user and attach to req.user if valid.
 * If the user is found, add it to req.user, otherwise add the error msg to req.loginMsg.
 */
const getAuthenticatedUser = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      req.loginMsg = err.name;
    } else if (!user) {
      req.loginMsg = "User not found";
    } else {
      req.user = user;
    }
    next();
  })(req, res, next);
};

/**
 * Middleware for protecting routes. Will return 401 or 403 if the user is not authenticated or not an admin.
 * Should be applied to routes that require authentication or admin access.
 * 
 * @param {boolean} isAdminOnly If the route is for admin users only.
 */
const auth = (isAdminOnly = false) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: req.loginMsg });
    if (isAdminOnly && !req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};

export { jwtStrategy, getAuthenticatedUser, auth };
