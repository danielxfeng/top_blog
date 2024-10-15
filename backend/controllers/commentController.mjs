import asyncHandler from "express-async-handler";
import { query, body } from "express-validator";
import { prisma } from "../app.mjs";
import validate from "../services/validate.mjs";

const getCommentsValidation = [
  query("postId").isInt().toInt().withMessage("Post ID must be an integer."),
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

// @desc    Get all comments by post ID
// @route   GET /api/comment
// @access  Public
const getCommentsController = [
  getCommentsValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Parse the cursor for pagination.
    const cursor = req.query.cursor
      ? { cursor: { id: req.query.cursor } }
      : undefined;
    // Parse the limit for pagination.
    // The maximum limit is the MAX_PAGE_SIZE
    // or 30 if the enviroment variable is not set.
    const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE) || 30;
    const limit =
      !req.query.limit || req.query.limit > maxPageSize
        ? maxPageSize
        : req.query.limit;

    // Fetch the comments.
    const comments = await prisma.blogComment.findMany({
      take: limit,
      ...(cursor ? cursor : {}),
      where: {
        postId: req.query.postId,
        isDeleted: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        content: true,
        updatedAt: true,
        authorId: true,
      },
      include: {
        BlogUser: { select: { username: true } },
      },
    });

    // Return the comments.
    return res.json(comments);
  }),
];

const createCommentValidation = [
  query("postId").isInt().toInt().withMessage("Post ID must be an integer."),
  body("content")
    .isLength({ min: 1, max: 1024 })
    .withMessage("Comment must be between 1 and 1024 characters"),
];

// @desc    Create a comment
// @route   POST /api/comment
// @access  Private
const createCommentController = [
  createCommentValidation,
  validate,
  asyncHandler(async (req, res) => {
    const comment = await prisma.blogComment.create({
      data: {
        content: req.body.content,
        postId: req.query.postId,
        authorId: req.user.id,
      },
      select: {
        id: true,
        postId: true,
        content: true,
        updatedAt: true,
        authorId: true,
        include: {
          BlogUser: { select: { username: true } },
        },
      },
    });
    return res.json(comment);
  }),
];

const updateCommentValidation = [
  query("commentId")
    .isInt()
    .toInt()
    .withMessage("Comment ID must be an integer."),
  body("content")
    .isLength({ min: 1, max: 1024 })
    .withMessage("Comment must be between 1 and 1024 characters"),
];

const updateCommentController = [
  updateCommentValidation,
  validate,
  asyncHandler(async (req, res) => {
    const comment = await prisma.blogComment.update({
      where: {
        id: req.query.commentId,
        authorId: req.user.id, // We should only allow the author to update the comment.
      },
      data: {
        content: req.body.content,
      },
      select: {
        id: true,
        postId: true,
        content: true,
        updatedAt: true,
        authorId: true,
        include: {
          BlogUser: { select: { username: true } },
        },
      },
    });
    return res.json(comment);
  }),
];

const deleteCommentValidation = [
  query("commentId")
    .isInt()
    .toInt()
    .withMessage("Comment ID must be an integer."),
];

// @desc    Delete a comment
// @route   DELETE /api/comment
// @access  Private
const deleteCommentController = asyncHandler(async (req, res) => {
  // Admin can delete any comment, the authors can only delete their own comment.
  const authorId = req.user.isAdmin ? undefined : { authorId: req.user.id };
  await prisma.blogComment.update({
    where: {
      id: req.query.commentId,
      ...(authorId || {}),
    },
    data: {
      isDeleted: true,
    },
  });
  if (!deletedComment) {
    return res.status(404).json({
      message:
        "Comment not found or you do not have permission to delete the comment.",
    });
  }
  return res.json({ message: "Comment deleted" });
});

export {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
};
