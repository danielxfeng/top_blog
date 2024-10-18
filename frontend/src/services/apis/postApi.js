import { host, parseResponse, getQuery } from "./common";

// A helper function to convert an array to a comma-separated string.
const arr2str = (arr) => (arr ? arr.join(",") : "");

// Get all posts from the server.
// See the API documentation for details.
const getPosts = async (queryObj = null) => {
  if (queryObj && queryObj.tags) queryObj.tags = arr2str(queryObj.tags);
  const queryString = queryObj
    ? `?${new URLSearchParams(queryObj).toString()}`
    : "";
  const response = await fetch(`${host}/post${queryString}`, getQuery("GET"));
  return parseResponse(response);
};

// Get a single post from the server.
// See the API documentation for details.
const getPost = async (id) => {
  const response = await fetch(`${host}/post/${id}`, getQuery("GET"));
  return parseResponse(response);
};

// Create a new post on the server.
// See the API documentation for details.
// If tags are provided, will be converted
// to a comma-separated string to meet the API requirements.
const createPost = async (title, content, tags = null) => {
  const tagsData = tags? { tags: arr2str(tags) } : {};
  const response = await fetch(
    `${host}/post`,
    getQuery("POST", { title, content, ...tagsData })
  );
  return parseResponse(response);
};

// Update a post on the server.
// See the API documentation for details.
// If tags are provided, will be converted
// to a comma-separated string to meet the API requirements.
const updatePost = async (id, payload) => {
  if (payload.tags) payload.tags = arr2str(payload.tags);
  const response = await fetch(`${host}/post/${id}`, getQuery("PUT", payload));
  return parseResponse(response);
};

// Delete a post from the server.
// See the API documentation for details.
const deletePost = async (id) => {
  const response = await fetch(`${host}/post/${id}`, getQuery("DELETE"));
  await parseResponse(response);
  return true;
};

export { getPosts, getPost, createPost, updatePost, deletePost };
