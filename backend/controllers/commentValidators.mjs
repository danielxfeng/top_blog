import { query, body, param } from "express-validator";

const idValidation = [
  param("id").isInt().toInt().withMessage("Comment ID must be an integer."),
];

const postIdValidation = [
  query("postId").isInt().toInt().withMessage("Post ID must be an integer."),
];

const getCommentsValidation = [
  ...postIdValidation,
  query("cursor")
    .optional()
    .isInt()
    .toInt()
    .withMessage("Cursor must be an integer."),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Limit must be an integer greater than 0."),
];

const contentValidation = [
  body("content")
    .isLength({ min: 1, max: 1024 })
    .withMessage("Comment must be between 1 and 1024 characters"),
];

const createCommentValidation = [
  ...postIdValidation,
  ...contentValidation,
];

const updateCommentValidation = [...idValidation, ...contentValidation];

const deleteCommentValidation = [...idValidation];

export {
  getCommentsValidation,
  createCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
};
