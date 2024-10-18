import { describe, it, expect } from "vitest";
import {
  userRegister,
  userLogin,
  getUserInfo,
  updateUserInfo,
  deleteUser,
} from "../src/services/apis/userApi";

describe("User API Test", () => {
  let sharedUser;
  let id;

  it("Returns an error when getting user info without login", async () => {
    try {
      await getUserInfo();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("Returns a user id when registering a user", async () => {
    const user = await userRegister("testUser", "testUserPassword");
    expect(user).toHaveProperty("id");
    id = user.id;
  });

  it("Returns an error when registering a user with the same username", async () => {
    try {
      await userRegister("testUser", "testUserPassword");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("Returns an error when logging in with wrong credentials", async () => {
    try {
      await userLogin("testUser", "wrongPassword");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("Returns a user and writes the token to localStorage when logging in", async () => {
    const user = await userLogin("testUser", "testUserPassword");
    const localUser = JSON.parse(localStorage.getItem("user"));
    expect(user).property("id").toBe(id);
    expect(user).property("id").toBe(localUser.id);
    expect(user).property("username").toBe("testUser");
    expect(user).property("username").toBe(localUser.username);
    expect(user).property("isAdmin").toBe(localUser.isAdmin);
    expect(user).property("token").toBe(localUser.token);
    sharedUser = user;
  });

  it("Returns user info when getting user info", async () => {
    const user = await getUserInfo();
    expect(user).property("id").toBe(id);
    expect(user).property("username").toBe("testUser");
    expect(user).property("isAdmin").toBe(false);
  });

  it("Returns a user and writes the token to localStorage when updating user info", async () => {
    const user = await updateUserInfo({ username: "testUserUpdated" });
    expect(user).property("id").toBe(id);
    expect(user).property("username").toBe("testUserUpdated");
    expect(user).property("token").not.toBe(sharedUser.token);
  });

  it("Returns an error when payload is empty", async () => {
    try {
      await updateUserInfo({});
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it("Returns true when deleting a user, and the localStorage has been removed.", async () => {
    const result = await deleteUser();
    expect(result).toBe(true);
    try {
      localStorage.getItem("user");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
