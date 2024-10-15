import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { prisma } from "../app.mjs";
import sign from "../services/auth/jwtSign.mjs";
import validate from "../services/validate.mjs";
import {
  userSignupValidation,
  userUpdateValidation,
} from "./userValidator.mjs";

// @desc    Get user info
// @route   GET /api/user
// @access  Private
const userInfoController = asyncHandler(async (req, res) => {
  const user = await prisma.blogUser.findFirst({
    where: { username: req.user.username, isDeleted: false },
    select: {
      id: true,
      username: true,
      isAdmin: true,
      // Also fetch the blogOauthUser data
      // because user may want to link or unlink their OAuth account.
      BlogOauthUser: {
        select: {
          provider: true,
          subject: true,
        },
      },
    },
  });

  return res.json(user);
});

// @desc    Register a new user
// @route   POST /api/user
// @access  Public
const userSignupController = [
  userSignupValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check duplicated signup.
    const existingUser = await prisma.blogUser.findFirst({
      where: { username, isDeleted: false },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt the password and insert to the database.
    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.blogUser.create({
      data: {
        username,
        password: encryptedPassword,
      },
      select: {
        id: true,
        username: true,
        isAdmin: true,
      },
    });

    // Prepare the JWT payload.
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Send the response.
    return res
      .status(201)
      .location("/api/user")
      .json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        token: sign(payload),
      });
  }),
];

// @desc    Update user info
// @route   PUT /api/user
// @access  Private
const userUpdateController = [
  userUpdateValidation,
  validate,
  asyncHandler(async (req, res) => {
    const { username, password, adminCode } = req.body;

    // Check if there are no fields to update.
    if (!username && !password && !adminCode) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Encrypt the password if it exists.
    const encryptedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Check if it's legal to add the admin flag.
    const isAdmin =
      adminCode && adminCode === process.env.ADMIN_CODE ? true : undefined;

    // Compose the updated value.
    const updatedValue = {
      ...(username && { username }),
      ...(password && { password: encryptedPassword }),
      ...(isAdmin && { isAdmin }),
    };

    // Update the database.
    const user = await prisma.blogUser.update({
      where: { id: req.user.id, isDeleted: false },
      data: updatedValue,
      select: {
        id: true,
        username: true,
        isAdmin: true,
      },
    });

    // Prepare the JWT payload.
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Send the response.
    return res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      token: sign(payload),
    });
  }),
];

// @desc    Delete user
// @route   DELETE /api/user
// @access  Private
const userDeleteController = asyncHandler(async (req, res) => {
  const newUserName = `&DELETED&${await bcrypt.hash(req.user.username, 10)}`;
  // Soft delete the user.
  await prisma.blogUser.update({
    where: { id: req.user.id, username: req.user.username, isDeleted: false },
    data: { isDeleted: true, deletedAt: new Date(), username: newUserName },
  });

  return res.status(204).end();
});

const userLoginValidation = [
  body("username")
    .isLength({ min: 6, max: 64 })
    .withMessage("Username must be between 6 and 64 characters")
    .isAlphanumeric("en-US", { ignore: "_-" })
    .withMessage("Username must be alphanumeric characters, and '_' or '-'"),
  body("password")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
const userLoginController = [
  userLoginValidation,
  validate,
  asyncHandler(async (req, res) => {
    // For validation errors.
    //const errors = validationResult(req);
    //if (!errors.isEmpty()) {
    //  return res.status(400).json({ message: errors.array() });
    //}

    const { username, password } = req.body;

    // Read from the database.
    const user = await prisma.blogUser.findFirst({
      where: { username, isDeleted: false },
      select: { id: true, username: true, isAdmin: true, password: true },
    });

    // Check the user and password.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Prepare the JWT payload.
    const payload = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    // Send the response.
    return res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      token: sign(payload),
    });
  }),
];

// @desc    OAuth callback
// @route   GET /api/user/"provider"/callback
// @access  Public
const userOauthCallbackController = asyncHandler(async (req, res) => {
  // We have checked the user in middleware, so we can just return the token.
  const payload = {
    id: req.user.id,
    username: req.user.username,
    isAdmin: req.user.isAdmin,
  };

  return res.json({
    id: req.user.id,
    username: req.user.username,
    isAdmin: req.user.isAdmin,
    token: sign(payload),
  });
});

export {
  userInfoController,
  userSignupController,
  userUpdateController,
  userDeleteController,
  userLoginController,
  userOauthCallbackController,
};
