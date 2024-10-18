import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  userRegister,
  userLogin,
  updateUserInfo,
  deleteUser,
} from "../src/services/apis/userApi";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../src/services/apis/postApi";

describe("Post API Test", () => {
  let ids = [];
  beforeAll(async () => {
    await userRegister("testAdminPost", "testpassword");
    await userLogin("testAdminPost", "testpassword");
    await updateUserInfo({ adminCode: "adminCode" });
  });

  afterAll(async () => {
    await Promise.all(
      ids.map((id) => {
        try {
          deletePost(id);
        } catch (error) {}
      })
    );
    await deleteUser();
  });

  it("Returns an empty array when there is no post", async () => {
    const Posts = await getPosts();
    expect(Posts).toEqual([]);
  });

  it("Returns an post after a new Post is created", async () => {
    const Post = await createPost("Test Post", "Test Content");
    expect(Post).toHaveProperty("id");
    ids.push(Post.id);
  });

  it("Returns an post after a new Post with tags is created", async () => {
    const Post = await createPost("Test Post2", "Test Content2", [
      "tag1",
      "tag2",
    ]);
    expect(Post).toHaveProperty("id");
    ids.push(Post.id);
  });

  it("Returns an error when creating a Post with an empty title", async () => {
    try {
      await createPost("", "Test Content");
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach this line");
    }
  });

  it("Returns an posts list after querying all Posts", async () => {
    const Posts = await getPosts();
    expect(Posts.length).toBe(2);
  });

  it("Returns a post after querying a single post", async () => {
    const Post = await getPost(ids[0]);
    expect(Post.title).toBe("Test Post");
    expect(Post.content).toBe("Test Content");
  });

  it("Returns the post with tag after querying a single post", async () => {
    const Post = await getPost(ids[1]);
    expect(Post.title).toBe("Test Post2");
    expect(Post.content).toBe("Test Content2");
    expect(Post.tags).toEqual(["tag1", "tag2"]);
  });

  it("Returns an error when querying a non-existent post", async () => {
    try {
      await getPost(0);
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach this line");
    }
  });

  it("Returns an post when using cursor", async () => {
    const post = await createPost("Test Post3", "Test Content3");
    expect(post).toHaveProperty("id");
    ids.push(post.id);
    const Posts = await getPosts({ cursor: ids[1] });
    expect(Posts.length).toBe(1);
  });

  it("Returns an post when filtering by tag", async () => {
    const Posts = await getPosts({ tags: ["tag1"] });
    expect(Posts.length).toBe(1);
  });

  it("Returns an post when updating a post", async () => {
    const Post = await updatePost(ids[0], { title: "Updated Title" });
    expect(Post.title).toBe("Updated Title");
  });

  it("Returns an error when updating a post with an empty title", async () => {
    try {
      await updatePost(ids[0], { title: "" });
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach this line");
    }
  });

  it("Returns an error when updating a non-existent post", async () => {
    try {
      await updatePost(0, { title: "Updated Title" });
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach this line");
    }
  });

  it("Returns true when deleting a post", async () => {
    const id = ids.shift();
    const result = await deletePost(id);
    expect(result).toBe(true);
  });

  it("Returns an error when deleting a non-existent post", async () => {
    try {
      await deletePost(0);
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error.message).not.toBe("Should not reach this line");
    }
  });
});
