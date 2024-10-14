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

postRouter.get("/", getPostsController);

postRouter.get("/:id", getPostController);

// Only admin can post, update and delete posts.
postRouter.use(auth(true));

postRouter.post("/posts/", createPostController);

postRouter.put("/posts/:id", updatePostController);

postRouter.delete("/posts/:id", deletePostController);

export default postRouter;
