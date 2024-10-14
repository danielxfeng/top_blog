import asyncHandler from "express-async-handler";

const createCommentController = asyncHandler(async (req, res) => {});
const updateCommentController = asyncHandler(async (req, res) => {});
const deleteCommentController = asyncHandler(async (req, res) => {});

export {
  createCommentController,
  updateCommentController,
  deleteCommentController,
};
