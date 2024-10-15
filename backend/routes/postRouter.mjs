import express from "express";
import { auth } from "../services/auth/jwtStrategy.mjs";
import {
  getPostsController,
  getPostController,
  createPostController,
  updatePostController,
  deletePostController,
} from "../controllers/postController.mjs";

const postRouter = express.Router();

/**
 * @swagger
 * /api/post:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts with pagination support.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The cursor for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of posts to return per page.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           example: "tag1, tag2"
 *         description: Filter posts by tags.
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           example: "2024-01-01"
 *         description: Start date of required date range.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           example: "2024-12-31"
 *         description: End date of required date range.
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The ID of the post
 *                       title:
 *                         type: string
 *                         description: The title of the post
 *                       content:
 *                         type: string
 *                         description: The content of the post
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       description: The tags of the post
 *                       updatedAt:
 *                         type: string
 *                         description: The date and time of the last update
 *                       authorId:
 *                         type: string
 *                         description: The username of the author
 *                       BlogUser.username:
 *                         type: string
 *                         description: The username of the author
 *                 total:
 *                   type: integer
 *                   description: The total number of posts
 *       500:
 *         description: Server error
 */
postRouter.get("/", getPostsController);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Retrieve a single post
 *     description: Get a post by its ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the post
 *                 title:
 *                   type: string
 *                   description: The title of the post
 *                 content:
 *                   type: string
 *                   description: The content of the post
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: The tags of the post
 *                 updatedAt:
 *                   type: string
 *                   description: The last update date of the post
 *                 authorId:
 *                   type: string
 *                   description: The username of the author
 *                 BlogUser.username:
 *                   type: string
 *                   description: The username of the author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.get("/:id", getPostController);

// Only admin can post, update and delete posts.
postRouter.use(auth(true));

/**
 * @swagger
 * /api/post:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post. Only the admin can create a post.
 *     tags: [Posts]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *             required:
 *               - title
 *               - content
 *     responses:
 *       201:
 *         description: Post created successfully
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: /api/post/1
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the post
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
postRouter.post("/", createPostController);

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Update an existing post
 *     description: Update a post by its ID.
 *                  Only the admin can update the post.
 *     tags: [Posts]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The JWT token
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *               tags:
 *                 type: string
 *                 description: The tags of the post
 *                 example: "tag1, tag2"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the post
 *                 title:
 *                   type: string
 *                   description: The title of the post
 *                 content:
 *                   type: string
 *                   description: The content of the post
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: The tags of the post
 *                 updatedAt:
 *                   type: string
 *                   description: The last update date of the post
 *                 authorId:
 *                   type: string
 *                   description: The username of the author
 *                 BlogUser.username:
 *                   type: string
 *                   description: The username of the author
 *       404:
 *         description: Post not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
postRouter.put("/:id", updatePostController);

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post by its ID.
 *     tags: [Posts]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         required: true
 *         description: The JWT token
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
postRouter.delete("/:id", deletePostController);

export default postRouter;
