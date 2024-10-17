/**
 * The test for the comment management.
 */
import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("Comment management test", () => {
  before(async () => {
    // Init the database.
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser", "BlogPost", "BlogTag" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("Returns an empty array when there is no tag", async () => {
    const response = await request(app).get("/api/tag").expect(200);
    expect(response.body).to.be.an("array").that.is.empty;
  });

  it("Returns all tags with post count", async () => {
    let adminToken;
    // Create an admin user.
    process.env.ADMIN_CODE = "testadmin";
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testadmin", password: "testpassword" })
      .expect(201);
    adminToken = response.body.token;

    const response2 = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ adminCode: "testadmin" })
      .expect(200);
    adminToken = response2.body.token;

    // Create several posts with tags.
    await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Test post", content: "Test content", tags: "tag1,tag2" })
      .expect(201);

    await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test post2",
        content: "Test content2",
        tags: "tag1,tag3",
      })
      .expect(201);

    await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test post2",
        content: "Test content2",
        tags: "tag1,tag2",
      })
      .expect(201);

    const testResponse = await request(app).get("/api/tag").expect(200);

    expect(testResponse.body).to.be.an("array").length(3);
    expect(testResponse.body[0]).to.have.property("tag", "tag1");
    expect(testResponse.body[0]).to.have.property("count", 3);
    expect(testResponse.body[1]).to.have.property("tag", "tag2");
    expect(testResponse.body[1]).to.have.property("count", 2);
    expect(testResponse.body[2]).to.have.property("tag", "tag3");
    expect(testResponse.body[2]).to.have.property("count", 1);
  });
});
