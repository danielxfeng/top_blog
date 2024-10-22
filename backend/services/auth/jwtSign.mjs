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

// Helper function for signing a JWT token.
const signHelper = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Sign a JWT token with the payload.
 *
 * @param {object} payload { id, username, isAdmin }
 * @returns {object} { accessToken, refreshToken }
 */
const sign = (payload) => {
  if (!isLegalPayload(payload)) throw new Error("Illegal payload");
  try {
    return {
      accessToken: signHelper(
        payload,
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRES_IN
      ),
      refreshToken: signHelper(
        payload,
        process.env.JWT_SECRET_REFRESH,
        process.env.JWT_EXPIRES_IN_REFRESH
      ),
    };
  } catch (error) {
    throw new Error("Failed to sign the token");
  }
};

export default sign;
