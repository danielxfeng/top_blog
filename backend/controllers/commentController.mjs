import asyncHandler from "express-async-handler";

const getCommentsController = asyncHandler(async (req, res) => {});
const createCommentController = asyncHandler(async (req, res) => {});
const updateCommentController = asyncHandler(async (req, res) => {});
const deleteCommentController = asyncHandler(async (req, res) => {});

export {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
};
