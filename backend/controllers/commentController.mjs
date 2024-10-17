import asyncHandler from "express-async-handler";
import { prisma } from "../app.mjs";
import validate from "../services/validate.mjs";
import {
  getCommentsValidation,
  createCommentValidation,
  updateCommentValidation,
  deleteCommentValidation,
} from "./commentValidators.mjs";
import e from "express";

// The model of select clauses for the comment entity.
const selectModel = {
  id: true,
  content: true,
  updatedAt: true,
  authorId: true,
  postId: true,
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
      ? { cursor: { id: req.query.cursor }, skip: 1 }
      : {};
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
      ...cursor,
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

    // Return the comments.
    return res.json(comments);
  }),
];

// @desc    Create a comment
// @route   POST /api/comment
// @access  Private
const createCommentController = [
  createCommentValidation,
  validate,
  asyncHandler(async (req, res) => {
    try {
      const comment = await prisma.blogComment.create({
        data: {
          content: req.body.content,
          postId: req.query.postId,
          authorId: req.user.id,
        },
        select: {
          id: true,
        },
      });

      return res.status(201).json(comment);
    } catch (error) {
      if (error.code === "P2003")
        return res.status(404).json({ message: "Post not found" });
      else throw error;
    }
  }),
];

const updateCommentController = [
  updateCommentValidation,
  validate,
  asyncHandler(async (req, res) => {
    try {
      const comment = await prisma.blogComment.update({
        where: {
          id: req.params.id,
          authorId: req.user.id, // We should only allow the author to update the comment.
        },
        data: {
          content: req.body.content,
        },
        select: {
          ...selectModel,
        },
      });

      return res.json(comment);
    } catch (error) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Comment not found or the user has not the permission." });
      else throw error;
    }
  }),
];

// @desc    Delete a comment
// @route   DELETE /api/comment
// @access  Private
const deleteCommentController = [
  deleteCommentValidation,
  asyncHandler(async (req, res) => {
    // Admin can delete any comment, the authors can only delete their own comment.
    const authorId = req.user.isAdmin ? {} : { authorId: req.user.id };
    try {
      await prisma.blogComment.update({
        where: {
          id: req.params.id,
          ...authorId,
        },
        data: {
          isDeleted: true,
        },
      });
      return res.status(204).end();
    } catch (error) {
      if (error.code === "P2025")
        return res.status(404).json({ message: "Comment not found or the user has not the permission." });
      else throw error;
    }

  }),
];

export {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
};
