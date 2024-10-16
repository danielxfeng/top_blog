import asyncHandler from "express-async-handler";
import validate from "../services/validate.mjs";
import { prisma } from "../app.mjs";
import {
  getPostsValidation,
  createPostValidation,
  getPostValidation,
  updatePostValidation,
} from "./postValidators.mjs";

// The model of select clauses for the post entity.
const selectModel = {
  id: true,
  title: true,
  content: true,
  tags: {
    select: { tag: true },
  },
  published: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: { username: true },
  },
};

// Generate a DAO from a post entity.
// @param post The post entity.
// @param isAbstract Generate the abstract instead of the content if true.
const generateDao = (post, isAbstract = false) => {
  // Cut the string to a maximum length.
  const cutString = (str, length) => {
    return str.length > length ? str.slice(0, length - 3) + "..." : str;
  };

  const maxAbstractLength = parseInt(process.env.MAX_ABSTRACT_LENGTH);
  const optional = isAbstract
    ? {
        abstract: cutString(post.content, maxAbstractLength || 100),
      }
    : { content: post.content };
  return {
    id: post.id,
    title: post.title,
    ...optional,
    published: post.published,
    tags: post.tags.map((item) => item.tag.tag),
    updatedAt: post.updatedAt,
    authorId: post.authorId,
    authorName: post.author.username,
  };
};

// @desc    Get all posts
// @route   GET /api/post
// @access  Public
const getPostsController = [
  getPostsValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Deal with the possible cursor for pagination
    const cursor = req.query.cursor ? { cursor: { id: req.query.cursor } } : {};
    const skip = req.query.cursor ? { skip: 1 } : {};

    // Parse the limit for pagination.
    // The maximum limit is the MAX_PAGE_SIZE
    // or 30 if the enviroment variable is not set.
    const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE) || 30;
    const limit =
      !req.query.limit || req.query.limit > maxPageSize
        ? maxPageSize
        : req.query.limit;

    // Parse the tags.
    const tags = req.query.tags
      ? {
          tags: {
            some: {
              tag: { in: req.query.tags.split(",").map((tag) => tag.trim()) },
            },
          },
        }
      : {};

    // Output the unpublished posts if the user is an admin.
    const published = req.user && req.user.isAdmin ? {} : { published: true };

    // Parse the date range.
    // If only one of the dates is provided, the other is set to the minimum or maximum date.
    // If neither date is provided, the range is not applied.
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;
    const dateRange =
      !from && !to
        ? {}
        : { updatedAt: { gte: from || new Date(0), lte: to || new Date() } };

    // Fetch the posts.
    const posts = await prisma.blogPost.findMany({
      ...skip,
      ...cursor,
      where: {
        ...tags,
        ...dateRange,
        ...published,
        isDeleted: false,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: { ...selectModel },
    });

    // Prepare the response.
    let dao = posts.map((post) => generateDao(post, true));
    res.json(dao);
  }),
];

// @desc    Get a post
// @route   GET /api/post/:id
// @access  Public
const getPostController = [
  getPostValidation,
  validate,
  asyncHandler(async (req, res) => {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      select: { ...selectModel },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const dao = generateDao(post);
    res.json(dao);
  }),
];

// @desc    Create a post
// @route   POST /api/post
// @access  Private
const createPostController = [
  createPostValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Parse the tags.
    const tags = req.body.tags
      ? req.body.tags.split(", ").map((tag) => tag.trim())
      : [];
    // The many to many relation.
    // see https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations
    const dataTags = tags
      ? {
          tags: {
            create: tags.map((tag) => ({
              tag: { connectOrCreate: { where: { tag }, create: { tag } } },
            })),
          },
        }
      : {};

    const post = await prisma.blogPost.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        ...dataTags,
        authorId: req.user.id,
      },
      select: { id: true },
    });

    res.status(201).location(`/api/post/${post.id}`).json(post);
  }),
];

// @desc    Update a post
// @route   PUT /api/post/:id
// @access  Private
const updatePostController = [
  updatePostValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Parse the title.
    const title = req.body.title ? { title: req.body.title } : {};

    // Parse the content.
    const content = req.body.content ? { content: req.body.content } : {};

    // Parse the tags.
    // Upsert the tags if they do not exist.
    // see https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#nested-writes
    const tags = req.body.tags
      ? {
          tags: {
            upsert: req.body.tags.map((tag) => ({
              create: { tag },
              update: { tag },
              where: { tag },
            })),
          },
        }
      : {};

    // Parse the published status.
    const published = req.body.published
      ? { published: req.body.published }
      : {};

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        ...title,
        ...content,
        ...tags,
        ...published,
      },
      select: { ...selectModel },
    });

    const dao = generateDao(post);

    res.json(dao);
  }),
];

// @desc    Delete a post
// @route   DELETE /api/post/:id
// @access  Private
const deletePostController = [
  getPostValidation,
  validate,
  asyncHandler(async (req, res) => {
    await prisma.blogPost.update({
      where: { id: req.params.id },
      data: { isDeleted: true },
    });

    res.status(204).end();
  }),
];

export {
  getPostsController,
  getPostController,
  createPostController,
  updatePostController,
  deletePostController,
};
