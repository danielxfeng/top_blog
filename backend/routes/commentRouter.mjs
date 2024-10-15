import express from "express";
import { auth } from "../services/auth/jwtStrategy.mjs";
import {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/commentController.mjs";

const commentRouter = express.Router();

/**
 * @swagger
 * /api/comment:
 *   get:
 *     summary: Get all comments by post ID
 *     description: Retrieve a list of all comments with pagination support.
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *           description: The ID of the post to which the comments belong
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Return the cursor of the pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of comments to return per page.
 *     responses:
 *       200:
 *         description: A list of comments
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
 *                         description: The ID of the comment
 *                       content:
 *                         type: string
 *                         description: The content of the post
 *                       updatedAt:
 *                         type: string
 *                         description: The date and time of the last update
 *                       authorId:
 *                         type: integer
 *                         description: The id of the author
 *                       BlogUser.username:
 *                         type: string
 *                         description: The username of the author
 *       500:
 *         description: Server error
 */
commentRouter.get("/comment", getCommentsController);

/**
 * @swagger
 * /api/comment:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment.
 *                  For authenticated user only.
 *     tags: [Comments]
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
 *               postId:
 *                 type: string
 *                 description: The ID of the post to which the comment belongs
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *             required:
 *               - postId
 *               - content
 *     responses:
 *       201:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the created comment
 *                 postId:
 *                   type: string
 *                   description: The ID of the post
 *                 content:
 *                   type: string
 *                   description: The content of the comment
 *                 updatededAt:
 *                   type: string
 *                   description: The date and time of the last update
 *                 authorId:
 *                   type: integer
 *                   description: The id of the author
 *                 BlogUser.username:
 *                   type: string
 *                   description: The username of the author
 *       401:
 *         description: Unauthorized - invalid JWT token
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
commentRouter.post("/comment/", auth(), createCommentController);

/**
 * @swagger
 * /api/comment/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Update an existing comment.
 *                  Only the author can update their own comment.
 *                  Requires a valid JWT token.
 *     tags: [Comments]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: The JWT token
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the comment
 *             required:
 *               - content
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
 *                   description: The ID of the updated comment
 *                 postId:
 *                   type: string
 *                   description: The ID of the post
 *                 content:
 *                   type: string
 *                   description: The content of the comment
 *                 updatedAt:
 *                   type: string
 *                   description: The date and time of the last update
 *                 authorId:
 *                   type: integer
 *                   description: The id of the author
 *                 BlogUser.username:
 *                   type: string
 *                   description: The username of the author
 *       401:
 *         description: Unauthorized - invalid JWT token
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
commentRouter.put("/comment/:id", auth(), updateCommentController);

/**
 * @swagger
 * /api/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete an existing comment.
 *                  The author can delete their own comment.
 *                  Admin can delete all comments.
 *                  Requires a valid JWT token.
 *     tags: [Comments]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: The JWT token
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: OK
 *       401:
 *         description: Unauthorized - invalid JWT token
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
commentRouter.delete("/comments/:id", auth(), deleteCommentController);

export default commentRouter;
