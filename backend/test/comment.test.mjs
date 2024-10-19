/**
 * The test for the comment management.
 */
import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("Comment management test", () => {
  let userToken1;
  let userId1;
  let userToken2;
  let userId2;
  let adminToken;
  let adminId;
  let postId; // post's ID.
  let commentId1; // comment's ID1.
  let commentId2; // comment's ID2.
  let commentId3; // comment's ID3.
  let cursor;
  let updatedAt; // The first comment's updated time.

  before(async () => {
    // Init the database.
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser", "BlogPost", "BlogComment" CASCADE;`;

    // Create 2 normal user and an admin user.
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    userId1 = response.body.id;
    userToken1 = response.body.token;

    const response2 = await request(app)
      .post("/api/user")
      .send({ username: "testuser2", password: "testpassword2" })
      .expect(201);

    userId2 = response2.body.id;
    userToken2 = response2.body.token;

    process.env.ADMIN_CODE = "testadmin";
    const response3 = await request(app)
      .post("/api/user")
      .send({ username: "testadmin", password: "testpassword" })
      .expect(201);

    adminToken = response3.body.token;

    const response4 = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ adminCode: "testadmin" })
      .expect(200);

    adminId = response4.body.id;
    adminToken = response4.body.token;

    const response5 = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test post", content: "Test content" })
      .expect(201);

    expect(response5.body).to.have.property("id");
    expect(response5.headers)
      .property("location")
      .to.equal(`/api/post/${response5.body.id}`);
    postId = response5.body.id;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("Returns an empty array of comments when there is nothing", async () => {
    const response = await request(app)
      .get(`/api/comment?postId=${postId}`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body).to.have.lengthOf(0);
  });

  it("Returns an empty array when the post does not exist", async () => {
    const response = await request(app)
      .get(`/api/comment?postId=0`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body).to.have.lengthOf(0);
  });

  it("Returns 201 when a comment is created", async () => {
    const response = await request(app)
      .post(`/api/comment?postId=${postId}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "Test comment" })
      .expect(201);

    expect(response.body).property("id").to.equal(response.body.id);
    commentId1 = response.body.id;
  });

  it("Returns 401 when a comment is created without a token", async () => {
    await request(app)
      .post(`/api/comment?postId=${postId}`)
      .send({ content: "Test comment" })
      .expect(401);
  });

  it("Returns 404 when a comment is created with an invalid post ID", async () => {
    await request(app)
      .post(`/api/comment?postId=0`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "Test comment" })
      .expect(404);
  });

  it("Returns 400 when a comment is created with an empty content", async () => {
    await request(app)
      .post(`/api/comment?postId=${postId}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "" })
      .expect(400);
  });

  it("Returns 400 when a comment is created with a too long content", async () => {
    await request(app)
      .post(`/api/comment?postId=${postId}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "a".repeat(1025) })
      .expect(400);
  });

  it("Returns 400 when the post without a post ID", async () => {
    await request(app)
      .post(`/api/comment`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "Test comment" })
      .expect(400);
  });

  it("Returns 201 when a comment is created by another user", async () => {
    const response = await request(app)
      .post(`/api/comment?postId=${postId}`)
      .set("Authorization", `Bearer ${userToken2}`)
      .send({ content: "Test comment" })
      .expect(201);

    expect(response.body).property("id").to.equal(response.body.id);
    commentId2 = response.body.id;
  });

  it("Returns 201 when a comment is created by an admin", async () => {
    const response = await request(app)
      .post(`/api/comment?postId=${postId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "Test comment" })
      .expect(201);

    expect(response.body).property("id").to.equal(response.body.id);
    commentId3 = response.body.id;
  });

  it("Returns 200 when the comments are retrieved", async () => {
    const response = await request(app)
      .get(`/api/comment?postId=${postId}`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body).to.have.lengthOf(3);
    expect(response.body[0]).property("id").to.equal(commentId3);
    expect(response.body[1]).property("id").to.equal(commentId2);
    expect(response.body[2]).property("id").to.equal(commentId1);
    expect(response.body[0]).property("authorId").to.equal(adminId);
    expect(response.body[1]).property("authorId").to.equal(userId2);
    expect(response.body[2]).property("authorId").to.equal(userId1);
    expect(response.body[0]).property("postId").to.equal(postId);
    expect(response.body[0]).property("content").to.equal("Test comment");
    cursor = response.body[1].id;
  });

  it("Returns 200 when the comments are retrieved with a limit", async () => {
    const response = await request(app)
      .get(`/api/comment?postId=${postId}&limit=2`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body).to.have.lengthOf(2);
    expect(response.body[0]).property("id").to.equal(commentId3);
    expect(response.body[1]).property("id").to.equal(commentId2);
  });

  it("Returns 200 when the comments are retrieved with a cursor", async () => {
    const response = await request(app)
      .get(`/api/comment?postId=${postId}&cursor=${cursor}`)
      .expect(200);

    expect(response.body).to.be.an("array");
    expect(response.body).to.have.lengthOf(1);
    expect(response.body[0]).property("id").to.equal(commentId1);
  });

  it("Returns 200 when the content of a comment is updated", async () => {
    const response = await request(app)
      .put(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "Updated comment" })
      .expect(200);

    expect(response.body).property("id").to.equal(commentId1);
    expect(response.body).property("content").to.equal("Updated comment");
    expect(response.body).property("updatedAt").to.not.equal(updatedAt);
    updatedAt = response.body.updatedAt;
  });

  it("Returns 401 when the content of a comment is updated without a token", async () => {
    await request(app)
      .put(`/api/comment/${commentId1}`)
      .send({ content: "Updated comment" })
      .expect(401);
  });

  it("Returns 404 when the content of a comment is updated by another user", async () => {
    await request(app)
      .put(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${userToken2}`)
      .send({ content: "Updated comment" })
      .expect(404);
  });

  it("Returns 404 when the content of a comment is updated by an admin", async () => {
    await request(app)
      .put(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "Updated comment" })
      .expect(404);
  });

  it("Returns 400 when the content of a comment is updated with an empty content", async () => {
    await request(app)
      .put(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "" })
      .expect(400);
  });

  it("Returns 404 when the content of a comment is updated with an invalid id", async () => {
    await request(app)
      .put(`/api/comment/0`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "Updated comment" })
      .expect(404);
  });

  it("Returns 400 when the content of a comment is updated with a too long content", async () => {
    await request(app)
      .put(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${userToken1}`)
      .send({ content: "a".repeat(1025) })
      .expect(400);
  });

  it("Returns 404 when the comment is deleted by another user", async () => {
    const response = await request(app)
      .delete(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${userToken2}`)
      .expect(404);
  });

  it("Returns 204 when the comment is deleted by an admin", async () => {
    const response = await request(app)
      .delete(`/api/comment/${commentId1}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);
  });

  it("Returns 204 when the comment is deleted by the author", async () => {
    const response = await request(app)
      .delete(`/api/comment/${commentId2}`)
      .set("Authorization", `Bearer ${userToken2}`)
      .expect(204);
  });

  it("Returns 404 when the delete a comment with an invalid ID", async () => {
    await request(app)
      .delete(`/api/comment/0`)
      .set("Authorization", `Bearer ${userToken1}`)
      .expect(404);
  });
});
