import express from "express";
import envdot from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import createError from "http-errors";
import swaggerRouter from "./routes/swaggerRouter.mjs";
import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRouter.mjs";
import postsRouter from "./routes/postsRouter.mjs";
import adminRouter from "./routes/adminRouter.mjs";

// Set the environment variables
envdot.config();

process.env.CORS_ORIGIN =
  process.env.NODE_ENV === "production" ? process.env.CORS_ORIGIN : "*";

process.env.PORT =
  process.env.NODE_ENV === "production"
    ? process.env.PORT_PROD || 80
    : process.env.PORT_DEV || 3000;

switch (process.env.NODE_ENV) {
  case "production":
    process.env.DB_URL = process.env.DB_URL_PROD;
    break;
  case "test":
    process.env.DB_URL = process.env.DB_URL_TEST;
    break;
  default:
    process.env.DB_URL = process.env.DB_URL_TEST;
}

// Auto update the Swagger JSON file in development
if (process.env.NODE_ENV === "development") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Fancy Blog API",
        version: "1.0.0",
      },
    },
    apis: ["./routes/*.js"],
  };
  const swaggerSpec = swaggerJsdoc(options);
  const swaggerFilePath = path.resolve(__dirname, "./swagger.json");
  // We have to compare the version for avoiding infinite loop
  // since "node --wathc" does not support file exclusion.
  const prev = fs.existsSync(swaggerFilePath)
    ? fs.readFileSync(swaggerFilePath, "utf8")
    : null;
  const curr = JSON.stringify(swaggerSpec, null, 2);
  if (prev !== curr) {
    fs.writeFileSync(swaggerFilePath, curr, "utf8");
  }
}

// Create the express app
const app = express();

// Enable CORS
var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the routes

// The Swagger UI
app.use("/", swaggerRouter);

// The user related routes, like:
// - register/login/logout.
// - Google OAuth.
app.use("/api/user", userRouter);

// The posts related routes, like:
// - list the posts, all posts or by tag, with pagination.
// - display a post, with comments.
// - create/edit/delete a comment.
app.use("/api/posts", postsRouter);

// The features related admin, like:
//  - list the posts, all posts or by tag, with pagination.
//  - create/edit/delete a post.
//  - delete a comment.
app.use("/api/admin", adminRouter);

// 404 Error handler
app.use((req, res, next) => {
  next(createError(404));
});

// General error handler
// Set the status code and send the error message as JSON.
// Only show the error message in development.
app.use((err, req, res, next) => {
  let msg = err.message;
  msg = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: msg });
});

// Prisma client
export const prisma = new PrismaClient();

// Disconnect the Prisma client when the server ends
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
