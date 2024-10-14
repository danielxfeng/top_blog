import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("User management tests", () => {
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  let token;

  it("Register a user", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    expect(response.body).to.deep.equal({
      username: "testuser",
      isAdmin: false,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");

    token = response.body.token;
  });

  it("Get a user", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).to.deep.equal({
      username: "testuser",
      isAdmin: false,
      BlogOauthUser: [],
    });
  });

  it("Login a user", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "testuser", password: "testpassword" })
      .expect(200);

    expect(response.body).to.deep.equal({
      username: "testuser",
      isAdmin: false,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
  });

  it("Update a username", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "testuser2" })
      .expect(200);

    expect(response.body).to.deep.equal({
      username: "testuser2",
      isAdmin: false,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
    expect(response.body.token).to.not.equal(token);

    token = response.body.token;
  });

  it("Update the isAdmin", async () => {
    process.env.adminCode = "testuser2";
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ adminCode: "testuser2" })
      .expect(200);

    expect(response.body).to.deep.equal({
      username: "testuser2",
      isAdmin: true,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
    expect(response.body.token).to.not.equal(token);

    token = response.body.token;
  });
});
