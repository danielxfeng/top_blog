import express from "express";
import { getTagsController } from "../controllers/tagController.mjs";

const tagRouter = express.Router();

/**
 * @swagger
 * /api/tag:
 *   get:
 *     summary: Get all tags with post count
 *     description: Retrieve a list of all tags with the count of posts.
 *     tags: [Tags]
 *     parameters:
 *     responses:
 *       200:
 *         description: A list of tags with post count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tag:
 *                         type: string
 *                         description: The name of tag.
 *                       count:
 *                         type: integer
 *                         description: The number of posts with the tag.
 *       500:
 *         description: Server error
 */
tagRouter.get("/", getTagsController);

export default tagRouter;
