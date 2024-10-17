import { body, query, param } from "express-validator";

const optionalTags = [
  query("tags")
    .optional()
    .trim()
    .isAlphanumeric("en-US", { ignore: "," })
    .withMessage("Tags must be alphanumeric"),
];

const getPostsValidation = [
  query("cursor")
    .optional()
    .isInt()
    .toInt()
    .withMessage("Cursor must be an integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Limit must be an integer greater than 0"),
  ...optionalTags,
  query("from").optional().isDate().withMessage("From must be a date"),
  query("to").optional().isDate().withMessage("To must be a date"),
];

const createPostValidation = [
  body("title")
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("content")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content must be at least 1 character"),
  ...optionalTags,
];

const getPostValidation = [
  param("id").isInt().toInt().withMessage("ID must be an integer"),
];

const updatePostValidation = [
  ...getPostValidation,
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("content")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content must be at least 1 character"),
  ...optionalTags,
  body("published")
    .optional()
    .isBoolean()
    .withMessage("Published must be a boolean"),
];

export {
  getPostsValidation,
  createPostValidation,
  getPostValidation,
  updatePostValidation,
};
