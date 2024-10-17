import GithubStrategy from "passport-github2";
import {
  generateOptions,
  generateVerifyFunc,
  generateOauthAuthMidware,
} from "./oauthStrategy.mjs";

/**
 * The GithubStrategy deals with the Github OAuth2.0 authentication.
 * Apply it in app.js.
 */
const githubStrategy = new GithubStrategy(
  generateOptions("github", "read:user"),
  generateVerifyFunc("github")
);

/**
 * The githubAuth middleware authenticates the user with Github OAuth2.0.
 * If the user is authenticated, the user object is stored in req.user.
 * If the user is not authenticated, will return a 401 status code.
 */
const githubAuth = generateOauthAuthMidware("github");

export { githubStrategy, githubAuth };
