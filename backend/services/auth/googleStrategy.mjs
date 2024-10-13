import GoogleStrategy from "passport-google-oidc";
import {
  generateOptions,
  generateVerifyFunc,
  generateOauthAuthMidware,
} from "./oauthStrategy.mjs";

/**
 * The GoogleStrategy deals with the Google OAuth2.0 authentication.
 * Apply it in app.js.
 */
const googleStrategy = new GoogleStrategy(
  generateOptions("google", "profile"),
  generateVerifyFunc("google")
);

/**
 * The googleAuth middleware authenticates the user with Google OAuth2.0.
 * If the user is authenticated, the user object is stored in req.user.
 * If the user is not authenticated, will return a 401 status code.
 */
const googleAuth = generateOauthAuthMidware("google");

export { googleStrategy, googleAuth };
