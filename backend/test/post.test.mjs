/**
 * The test for the post management.
 */
import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("Basic post test", () => {
  let userToken;
  let userId;
  let userName;
  let adminToken;
  let adminId;
  let adminName;
  let postId; // The first post's ID.
  let tagPostId; // The second post's ID.
  let tagsPostId; // The third post's ID.
  let cursor;
  let timestamp; // The second post's updated time.

  before(async () => {
    // Init the database.
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser", "BlogPost", "BlogTag", "BlogTagOnPost" CASCADE;`;

    // Create a normal user and an admin user.
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    userId = response.body.id;
    userName = response.body.username;
    userToken = response.body.token;

    process.env.ADMIN_CODE = "testadmin";
    const response2 = await request(app)
      .post("/api/user")
      .send({ username: "testadmin", password: "testpassword" })
      .expect(201);

    adminToken = response2.body.token;

    const response3 = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ adminCode: "testadmin" })
      .expect(200);

    adminId = response3.body.id;
    adminName = response3.body.username;
    adminToken = response3.body.token;
  });

  after(async () => {
    //await prisma.$disconnect();
  });

  it("Returns a empty array when there is no posts.", async () => {
    process.env.MAX_ABSTRACT_LENGTH = 100;
    const response = await request(app).get("/api/post").expect(200);
    expect(response.body).to.deep.equal([]);
  });

  it("Returns a 404 when the post is not found.", async () => {
    await request(app).get("/api/post/0").expect(404);
  });

  it("Returns a 400 when the ID is not an integer.", async () => {
    await request(app).get("/api/post/a").expect(400);
  });

  it("Returs a 201 when a post is created", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test post", content: "Test content" })
      .expect(201);

    expect(response.body).to.have.property("id");
    expect(response.headers)
      .property("location")
      .to.equal(`/api/post/${response.body.id}`);
    postId = response.body.id;
  });

  it("Returns a 200 when the post is found.", async () => {
    const response = await request(app).get(`/api/post/${postId}`).expect(200);
    expect(response.body).property("id").to.equal(postId);
    expect(response.body).property("title").to.equal("Test post");
    expect(response.body).property("content").to.equal("Test content");
    expect(response.body).property("authorId").to.equal(adminId);
    expect(response.body).property("authorName").to.equal(adminName);
    expect(response.body).property("tags").to.deep.equal([]);
    expect(response.body).property("updatedAt").to.be.a("string");
    expect(response.body).property("published").to.be.false;
  });

  it("Returns a 400 when the title is missing.", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "Test content" })
      .expect(400);
  });

  it("Returns a 400 when the content is missing.", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test post" })
      .expect(400);
  });

  it("Returns a 403 when the user is not an admin.", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "T", content: "T" })
      .expect(403);
  });

  it("Returns a 401 when submit without a token.", async () => {
    await request(app)
      .post("/api/post")
      .send({ title: "T", content: "T" })
      .expect(401);
  });

  it("Returns a 201 when a post is created with a tag.", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test post2", content: "Test content2", tags: " tag1 " })
      .expect(201);

    expect(response.headers)
      .property("location")
      .to.equal(`/api/post/${response.body.id}`);

    tagPostId = response.body.id;
    timestamp = response.body.updatedAt;
  });

  it("Returns a 200 when the post is found with a tag.", async () => {
    const response = await request(app)
      .get(`/api/post/${tagPostId}`)
      .expect(200);
    expect(response.body).property("tags").to.deep.equal(["tag1"]);
  });

  it("Returns a 201 when a post is created with multiple tags.", async () => {
    const response = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test post3",
        content: "Test content3",
        tags: " tag1, tag2, tag3 ",
      })
      .expect(201);

    expect(response.headers)
      .property("location")
      .to.equal(`/api/post/${response.body.id}`);

    tagsPostId = response.body.id;
  });

  it("Returns a 200 when the post is found with multiple tags.", async () => {
    const response = await request(app)
      .get(`/api/post/${tagsPostId}`)
      .expect(200);

    const tags = response.body.tags;
    tags.sort();
    expect(tags).to.deep.equal(["tag1", "tag2", "tag3"]);
  });

  it("Returns a 200 when all posts are found as an admin.", async () => {
    const response = await request(app)
      .get("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).to.have.lengthOf(3);
    expect(response.body[2]).property("id").to.equal(postId);
    expect(response.body[2]).has.property("abstract").to.equal("Test content");
    expect(response.body.every((item) => item.published == false)).to.be.true;
    console.log("response.body", response.body);
  });

  it("Returns a 200 with a good abstract property.", async () => {
    process.env.MAX_ABSTRACT_LENGTH = 3;
    const response = await request(app)
      .get("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);
    expect(response.body[2]).property("abstract").to.equal("...");
  });

  it("Returns only 2 posts when the limit is set to 2.", async () => {
    const response = await request(app)
      .get("/api/post?limit=2")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).to.have.lengthOf(2);
    cursor = response.body[1].id;
  });

  it("Returns only 1 post when the cursor is set.", async () => {
    const response = await request(app)
      .get(`/api/post?cursor=${cursor}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).to.have.lengthOf(1);
  });

  it("Returns empty when all posts are unpublished as a user.", async () => {
    const response = await request(app)
      .get("/api/post")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).to.deep.equal([]);
  });

  /** 
  it("Returns right posts when filter by tag.", async () => {
    const res = await request(app)
      .get("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    console.log("posts", res.body);

    const response = await request(app)
      .get("/api/post?tags=tag1")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).to.have.lengthOf(2);
  });
  */
});
