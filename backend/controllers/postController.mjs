import asyncHandler from 'express-async-handler';

const getPostsController = asyncHandler(async (req, res) => {});
const getPostController = asyncHandler(async (req, res) => {});
const createPostController = asyncHandler(async (req, res) => {});
const updatePostController = asyncHandler(async (req, res) => {});
const deletePostController = asyncHandler(async (req, res) => {});

export {
  getPostsController,
  getPostController,
  createPostController,
  updatePostController,
  deletePostController,
};
