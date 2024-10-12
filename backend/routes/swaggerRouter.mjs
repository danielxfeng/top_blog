import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import fs from "fs";
import path from "path";

const swaggerRouter = express.Router();

// Define controller for production environment.
const prodController = (req, res, next) => {
  swaggerUi.setup(swaggerDocument)(req, res, next);
};

// Define controller for development environment.
const devController = (req, res, next) => {
  const dynamicSwaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "./swagger.json"), "utf8")
  );
  swaggerUi.setup(dynamicSwaggerDocument)(req, res, next);
};

// Route the Swagger UI.
swaggerRouter.use("/", swaggerUi.serve);

// Apply different controllers based on the environment.
swaggerRouter.get(
  "/",
  process.env.NODE_ENV === "production" ? prodController : devController
);

export default swaggerRouter;
