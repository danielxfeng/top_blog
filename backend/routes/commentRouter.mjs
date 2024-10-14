import express from "express";
import { auth } from "../services/auth/jwtStrategy.mjs";
import {
  createCommentController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/commentController.mjs";

const commentRouter = express.Router();

commentRouter.post("/comment/", auth(), createCommentController);

commentRouter.put("/comment/:id", auth(), updateCommentController);

commentRouter.delete("/comments/:id", auth(), deleteCommentController);

export default commentRouter;
