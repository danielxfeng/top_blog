import { host, parseResponse, getQuery } from "./common";

// Get all tags from the server.
// See the API documentation for details.
const getTags = async () => {
  const response = await fetch(`${host}/tag`, getQuery("GET"));
  return parseResponse(response);
}

export { getTags };
