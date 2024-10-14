import { validationResult } from "express-validator";

/**
 * The middleware to validate the request.
 * If there are errors, return a 400 status code with the error message.
 * If there are no errors, call the next middleware.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors
        .array()
        .reduce((acc, cur) => acc + cur.msg + " ", "")
        .trim(),
    });
  }
  next();
};

export default validate;
