import { query, body } from "express-validator";

const idValidation = [
  query("commentId")
    .isInt()
    .toInt()
    .withMessage("Comment ID must be an integer."),
];
const getCommentsValidation = [
  ...idValidation,
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

const createCommentValidation = [
  ...idValidation,
  body("content")
    .isLength({ min: 1, max: 1024 })
    .withMessage("Comment must be between 1 and 1024 characters"),
];

const updateCommentValidation = [...createCommentValidation];

const deleteCommentValidation = [...idValidation];

export {
  getCommentsValidation,
  createCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
};
