import asyncHandler from "express-async-handler";
import { body, query } from "express-validator";
import validate from "../services/validate.mjs";

// The model of select clauses for the post entity.
const selectModel = {
  id: true,
  title: true,
  content: true,
  BlogPostTag: {
    select: { tag: true },
  },
  published: true,
  updatedAt: true,
  authorId: true,
  BlogUser: { select: { username: true } },
};

// Generate a DAO from a post entity.
// @param post The post entity.
// @param isAbstract Generate the abstract instead of the content if true.
const generateDao = (post, isAbstract = false) => {
  // Cut the string to a maximum length.
  const cutString = (str, length) => {
    return str.length > length ? str.slice(0, length - 3) + "..." : str;
  };

  const optional = isAbstract
    ? {
        abstract: cutString(
          post.content,
          process.env.MAX_ABSTRACT_LENGTH || 100
        ),
      }
    : { content: post.content };

  return {
    id: post.id,
    title: post.title,
    ...optional,
    published: post.published,
    tags: post.BlogPostTag.map((tag) => tag.tag),
    updatedAt: post.updatedAt,
    authorId: post.authorId,
    authorname: post.BlogUser.username,
  };
};

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
  query("tags")
    .optional()
    .trim()
    .isAlphanumeric("us_EN", { ignore: ", " })
    .withMessage("Tags must be alphanumeric"),
  query("from").optional().isDate().withMessage("From must be a date"),
  query("to").optional().isDate().withMessage("To must be a date"),
];

// @desc    Get all posts
// @route   GET /api/post
// @access  Public
const getPostsController = [
  getPostsValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Deal with the possible cursor for pagination
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

    // Parse the tags.
    const tags = req.query.tags
      ? { tags: { hasSome: req.query.tags.split(", ") } }
      : undefined;

    // Output the unpublished posts if the user is an admin.
    const published = req.user && req.user.isAdmin ? {} : { published: true };

    // Parse the date range.
    // If only one of the dates is provided, the other is set to the minimum or maximum date.
    // If neither date is provided, the range is not applied.
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;
    const dateRange =
      !from && !to
        ? undefined
        : { updatedAt: { gte: from || new Date(0), lte: to || new Date() } };

    // Fetch the posts.
    const posts = await prisma.blogPost.findMany({
      where: {
        ...(tags || {}),
        ...(dateRange || {}),
        ...(published || {}),
        ...(cursor || {}),
        isDeleted: false,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        ...selectModel,
      },
    });

    // Prepare the response.
    let dao = posts.map((post) => generateDao(post, true));

    // We only send the abstract for the posts.
    dao.forEach((post) => {
      post.abstract = post.content.slice(
        0,
        process.env.MAX_ABSTRACT_LENGTH || 100
      );
      delete post.content;
    });

    res.json(dao);
  }),
];

const getPostValidation = [
  query("id").isInt().toInt().withMessage("ID must be an integer"),
];

// @desc    Get a post
// @route   GET /api/post/:id
// @access  Public
const getPostController = [
  getPostValidation,
  validate,
  asyncHandler(async (req, res) => {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.query.id },
      select: {
        ...selectModel,
      },
    });

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const dao = generateDao(post);

    res.json(generateDao(dao));
  }),
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
  body("tags")
    .optional()
    .isString()
    .trim()
    .isAlphanumeric("us_EN", { ignore: ", " })
    .withMessage("Tags must be alphanumeric"),
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

    const post = await prisma.blogPost.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        BlogPostTag: {
          // Create the tags if they do not exist
          createOrConnect: tags.map((tag) => ({
            where: { tag },
            create: { tag },
          })),
        },
        authorId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    res.status(201).location(`/post/${post.id}`).json(post);
  }),
];

const updatePostValidation = [
  query("id").isInt().toInt().withMessage("ID must be an integer"),
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
  body("tags")
    .optional()
    .isString()
    .trim()
    .isAlphanumeric("us_EN", { ignore: ", " })
    .withMessage("Tags must be alphanumeric"),
  body("published")
    .optional()
    .isBoolean()
    .withMessage("Published must be a boolean"),
];

// @desc    Update a post
// @route   PUT /api/post/:id
// @access  Private
const updatePostController = [
  updatePostValidation,
  validate,
  asyncHandler(async (req, res) => {
    // Parse the title.
    const title = req.body.title ? { title: req.body.title } : undefined;

    // Parse the content.
    const content = req.body.content
      ? { content: req.body.content }
      : undefined;

    // Parse the tags.
    const tags = req.body.tags
      ? {
          BlogPostTag: {
            // Create the tags if they do not exist
            createOrConnect: tags.map((tag) => ({
              where: { tag },
              create: { tag },
            })),
          },
        }
      : [];

    // Parse the published status.
    const published = req.body.published
      ? { published: req.body.published }
      : undefined;

    const post = await prisma.blogPost.update({
      where: { id: req.query.id },
      data: {
        ...(title || {}),
        ...(content || {}),
        ...(tags || {}),
        ...(published || {}),
      },
      select: {
        ...selectModel,
      },
    });

    const dao = generateDao(post);

    res.json(dao);
  }),
];

const deletePostController = [
  getPostValidation,
  validate,
  asyncHandler(async (req, res) => {
    await prisma.blogPost.update({
      where: { id: req.query.id },
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
