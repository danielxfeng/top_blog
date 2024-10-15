import asyncHandler from "express-async-handler";
import { prisma } from "../app.mjs";
import validate from "../services/validate.mjs";
import {
  getCommentsValidation,
  createCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
} from "./commentValidators.mjs";

// The model of select clauses for the comment entity.
const selectModel = {
  id: true,
  content: true,
  updatedAt: true,
  authorId: true,
  BlogUser: { select: { username: true } },
};

// Generate a DAO from a comment entity.
const generateDao = (comment) => {
  return {
    id: comment.id,
    content: comment.content,
    updatedAt: comment.updatedAt,
    authorId: comment.authorId,
    authorName: comment.BlogUser.username,
  };
};

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
        ...selectModel,
      },
    });

    const dao = comments.map((comment) => generateDao(comment));

    // Return the comments.
    return res.json(dao);
  }),
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
        ...selectModel,
      },
    });

    const dao = generateDao(comment);
    return res.json(dao);
  }),
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
        ...selectModel,
      },
    });

    const dao = generateDao(comment);
    return res.json(dao);
  }),
];

// @desc    Delete a comment
// @route   DELETE /api/comment
// @access  Private
const deleteCommentController = [
  deleteCommentValidation,
  asyncHandler(async (req, res) => {
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
  }),
];

export {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
};
