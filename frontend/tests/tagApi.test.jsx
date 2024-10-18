import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  userRegister,
  userLogin,
  updateUserInfo,
  deleteUser,
} from "../src/services/apis/userApi";
import { createPost, updatePost, deletePost } from "../src/services/apis/postApi";
import { getTags } from "../src/services/apis/tagApi";

describe("Tag API Test", () => {
  let posts = [];
  beforeAll(async () => {
    // A new admin.
    await userRegister("testAdminTag", "testpassword");
    await userLogin("testAdminTag", "testpassword");
    await updateUserInfo({ adminCode: "adminCode" });

    let response = null;
    // Set up some posts.
    response = await createPost("Test Post1", "Test Content1", [
      "tag1",
      "tag2",
    ]);
    posts.push(response.id);
    response = await createPost("Test Post2", "Test Content2", [
      "tag1",
      "tag3",
    ]);
    posts.push(response.id);
    response = await createPost("Test Post3", "Test Content3", [
      "tag1",
      "tag2",
    ]);
    posts.push(response.id);
    await Promise.all(
      posts.map((id) => {
        return updatePost(id, { published: true });
      })
    );
  });

  afterAll(async () => {
    // Clean up.
    await Promise.all(
      posts.map((post) => {
        try {
          deletePost(post);
        } catch (error) {}
      })
    );
    deleteUser();
  });

  it("Returns right result", async () => {
    // Get all tags.
    const tags = await getTags();
    expect(tags).toEqual([
      { tag: "tag1", count: 3 },
      { tag: "tag2", count: 2 },
      { tag: "tag3", count: 1 },
    ]);
  });
});
