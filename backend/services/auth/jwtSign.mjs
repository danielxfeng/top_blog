import jwt from "jsonwebtoken";

// To check the payload for JWT signing is legal.
// The payload must have a id and username and isAdmin.
const isLegalPayload = (payload) => {
  return (
    payload &&
    payload.id &&
    payload.username &&
    typeof payload.isAdmin === "boolean"
  );
};

/**
 * Sign a JWT token with the payload.
 * 
 * @param {object} payload { id, username, isAdmin }
 * @returns the JWT token
 */
const sign = (payload) => {
  if (!isLegalPayload(payload)) throw new Error("Illegal payload");
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (error) {
    throw new Error("Failed to sign the token");
  }
};

export default sign;
