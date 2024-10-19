import { host, parseResponse, getQuery } from "./common";

// Get all comments from the server.
// See the API documentation for details.
const getComments = async (postId, queryObj = null) => {
  const queryString = queryObj
    ? `?${new URLSearchParams({ postId, ...queryObj }).toString()}`
    : `?${new URLSearchParams({ postId }).toString()}`;
  const response = await fetch(
    `${host}/comment/${queryString}`,
    getQuery("GET")
  );
  return parseResponse(response);
};

// Create a new comment.
// See the API documentation for details.
const createComment = async (postId, content) => {
  const queryString = `?${new URLSearchParams({ postId, content }).toString()}`;
  const response = await fetch(
    `${host}/comment/${queryString}`,
    getQuery("POST", { content })
  );
  return parseResponse(response);
};

// Update a comment.
// See the API documentation for details.
const updateComment = async (id, content) => {
  const response = await fetch(
    `${host}/comment/${id}`,
    getQuery("PUT", { content })
  );
  return parseResponse(response);
};

// Delete a comment.
// See the API documentation for details.
const deleteComment = async (id) => {
  const response = await fetch(`${host}/comment/${id}`, getQuery("DELETE"));
  await parseResponse(response);
  return true;
};

export { getComments, createComment, updateComment, deleteComment };
