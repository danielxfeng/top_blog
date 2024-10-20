import { body } from "express-validator";

const userSignupValidation = [
  body("username")
    .isLength({ min: 6, max: 64 })
    .withMessage("Username must be between 6 and 64 characters")
    .isAlphanumeric("en-US", { ignore: "_-" })
    .withMessage("Username must be alphanumeric characters, and '_' or '-'"),
  body("password")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

const userLoginValidation = [
  body("username")
    .optional()
    .isLength({ min: 6, max: 64 })
    .withMessage("Username must be between 6 and 64 characters")
    .isAlphanumeric("en-US", { ignore: "_-" })
    .withMessage("Username must be alphanumeric characters, and '_' or '-'"),
  body("password")
    .optional()
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

const userUpdateValidation = [
  ...userLoginValidation,
  body("adminCode")
    .optional()
    .isLength({ min: 6, max: 64 })
    .withMessage("Admin code must be between 6 and 64 characters"),
];

export { userSignupValidation, userUpdateValidation, userLoginValidation };
