import express from "express";
import passport from "passport";
import { auth } from "../services/auth/jwtStrategy.mjs";
import { googleAuth } from "../services/auth/googleStategy.mjs";
import {
  userInfoController,
  userSignupController,
  userUpdateController,
  userDeleteController,
  userLoginController,
  userLogoutController,
  userGoogleCallbackController,
} from "../controllers/userController.mjs";

const userRouter = express.Router();

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user.
 *                  - Username shoule be 6 to 64 characters, and unique.
 *                  - Password should be 6 to 64 characters, and secure.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: OK
 *         headers:
 *           Location:
 *             description: URL to get the user information
 *             schema:
 *               type: string
 *               example: /api/user/
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The registered username
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
userRouter.post("/", userSignupController);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     description: User login
 *                  - Username should be 6 to 64 characters, and unique.
 *                  - Password should be 6 to 64 characters, and secure.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The logged-in username
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.post("/login", userLoginController);

/**
 * @swagger
 * /api/user/google:
 *   get:
 *     summary: Oauth login with Google.
 *     description: Redirect to Google for OAuth login.
 *     responses:
 *       302:
 *         description: Redirecting to Google for authentication
 *       500:
 *         description: Server error
 */
userRouter.get("/oauth/google", passport.authenticate("google"));

/**
 * @swagger
 * /api/user/google/bind/callback:
 *   get:
 *     summary: Handle Google OAuth callback for creating or binding.
 *     description: Handle Google OAuth callback to create a new user or bind to an existing user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Optional JWT token, leave empty for creating a new user.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The registered username
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Unauthorized - invalid JWT token
 *       409:
 *         description: The account already bound to another user
 *       500:
 *         description: Server error
 */
userRouter.get(
  "/oauth/google/callback",
  googleAuth,
  userGoogleCallbackController
);

//
// The following routes require authentication.
//

userRouter.use(auth());

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get the user information
 *     description: Get the user information.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: User's username, max 64 characters
 *                 isAdmin:
 *                   type: boolean
 *                   description: Is the user an admin
 *                 oauthProviders:
 *                   type: array
 *                   description: List of OAuth providers and subjects
 *                   items:
 *                     type: object
 *                     properties:
 *                       provider:
 *                         type: string
 *                         description: OAuth provider (e.g., Google, Facebook)
 *                       subject:
 *                         type: string
 *                         description: OAuth subject (unique identifier from the provider)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.get("/", userInfoController);

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update the user information
 *     description: Update the user information.
 *                  - Username shoule be 6 to 64 characters, and unique.
 *                  - Password should be 6 to 64 characters, and secure.
 *                  - Confirm password should match the password.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               unLinkGoogle:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The registered username
 *                 token:
 *                   type: string
 *                   description: Optional new JWT token
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.put("/", userUpdateController);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete the user
 *     description: Delete the user.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token
 *     responses:
 *       204:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
userRouter.delete("/", userDeleteController);

/**
 * @swagger
 * /api/user/logout:
 *   get:
 *     summary: User logout
 *     description: User logout
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Server error
 */
userRouter.get("/logout", userLogoutController);

export default userRouter;
