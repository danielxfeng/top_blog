import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  userRegister,
  userLogin,
  updateUserInfo,
  deleteUser,
} from "../src/services/apis/userApi";
import { createPost, deletePost } from "../src/services/apis/postApi";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../src/services/apis/commentApi";

describe("Comment API Test", () => {
  let postId = null;
  let comments = [];
  beforeAll(async () => {
    // A new admin.
    await userRegister("testAdminComment", "testpassword");
    await userLogin("testAdminComment", "testpassword");
    await updateUserInfo({ adminCode: "adminCode" });

    // A new post.
    const response = await createPost("Test Post", "Test Content");
    postId = response.id;
  });

  afterAll(async () => {
    await Promise.all(
      comments.map(async (comment) => {
        try {
          await deleteComment(comment.id);
        } catch {}
      })
    );
    await deletePost(postId);
    await deleteUser();
  });

  it("Returns an empty array when there is no comments.", async () => {
    // Get all comments.
    const comments = await getComments(postId);
    expect(comments).toEqual([]);
  });

  it("Creates a new comment.", async () => {
    // Create a new comment.
    const response = await createComment(postId, "Test Comment");
    expect(response).toHaveProperty("id");
    comments.push(response.id);
  });

  it("Returns an error when creating a comment with empty content.", async () => {
    // Create a new comment.
    try {
      await createComment(postId, "");
      throw new Error("Should not reach here.");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach here.");
    }
  });

  it("Updates a comment.", async () => {
    // Update the comment.
    const response = await updateComment(comments[0], "Updated Comment");
    expect(response.content).toEqual("Updated Comment");
  });

  it("Returns an error when updating a comment with invalid pageid.", async () => {
    // Update the comment.
    try {
      await updateComment(0, "Updated Comment");
      throw new Error("Should not reach here.");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach here.");
    }
  });

  it("Returns 201 when adding a new comment.", async () => {
    // Create a new comment.
    const response = await createComment(postId, "Test Comment2");
    expect(response).toHaveProperty("id");
    comments.push(response.id);
  });

  it("Return another 201 to add the third comment.", async () => {
    // Create a new comment.
    const response = await createComment(postId, "Test Comment3");
    expect(response).toHaveProperty("id");
    comments.push(response.id);
  });

  it("Returns an array of comments.", async () => {
    // Get all comments.
    const response = await getComments(postId);
    expect(response.length).toBe(3);
  });

  it("Returns an array when requesting with a limit.", async () => {
    // Get all comments.
    const response = await getComments(postId, { limit: 1 });
    expect(response.length).toBe(1);
  });

  it("Returns an array when requesting with a cursor.", async () => {
    // Get all comments.
    const response = await getComments(postId, { cursor: comments[1] });
    expect(response.length).toBe(1);
  });


  it("Deletes a comment.", async () => {
    // Delete the comment.
    const id = comments.shift();
    const res = await deleteComment(id);
    expect(res).toBe(true);
  });

  it("Returns an error when deleting a comment with invalid id.", async () => {
    // Delete the comment.
    try {
      await deleteComment(0);
      throw new Error("Should not reach here.");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach here.");
    }
  });

  it("Returns the right number of comments.", async () => {
    // Get all comments.
    const response = await getComments(postId);
    expect(response.length).toBe(2);
  });
});
