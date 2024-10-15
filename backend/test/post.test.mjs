/**
 * The test for the comment management.
 * Have not test the OAuth part.
 */
import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("Comment management tests", () => {
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  let token;
  let id;

  it("A normal user's life circle, from registion to deletion.", async () => {
    // Create a new user, should reply a token.
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    expect(response.headers.location).to.equal("/api/user");

    expect(response.body).to.deep.equal({
      id: response.body.id,
      username: "testuser",
      isAdmin: false,
      token: response.body.token,
    })
    expect(response.body.id).to.be.a("number");
    expect(response.body.token).to.be.a("string");
    
    id = response.body.id;
    token = response.body.token;
  });

  // Get by the token, should reply the user info.
  it("Get a user", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).to.deep.equal({
      id: id,
      username: "testuser",
      isAdmin: false,
      BlogOauthUser: [],
    });
  });

  // Login the user, should reply the same token.
  it("Login a user", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "testuser", password: "testpassword" })
      .expect(200);

    expect(response.body).to.deep.equal({
      id: id,
      username: "testuser",
      isAdmin: false,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");

    expect(response.body.token).to.equal(token);
  });

  // Update the username, should reply the updated info and a new token.
  it("Update a username", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "testuser2" })
      .expect(200);

    expect(response.body).to.deep.equal({
      id: id,
      username: "testuser2",
      isAdmin: false,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
    expect(response.body.token).to.not.equal(token);

    token = response.body.token;
  });

  // Update the isAdmin, should reply the updated info and  a new token.
  // And got 401 when trying to get the user by the old token.
  it("Update the isAdmin", async () => {
    process.env.ADMIN_CODE = "testuser2";
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ adminCode: "testuser2" })
      .expect(200);

    expect(response.body).to.deep.equal({
      id: id,
      username: "testuser2",
      isAdmin: true,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
    expect(response.body.token).to.not.equal(token);

    const response2 = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);

    token = response.body.token;
  });

  // Update the password, should reply the same info,
  // and the token is also the same.
  it("Update the passowrd", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "changedpassowrd" })
      .expect(200);

    expect(response.body).to.deep.equal({
      id: id,
      username: "testuser2",
      isAdmin: true,
      token: response.body.token,
    });
    expect(response.body.token).to.be.a("string");
    expect(response.body.token).to.equal(token);

    token = response.body.token;
  });

  // Delete the user, should reply 204.
  // And got 401 when trying to get the user by the token.
  it("Delete a user", async () => {
    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const response2 = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  });
});

describe("Illegal input test when signup", () => {
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("The empty input", async () => {
    const response = await request(app).post("/api/user").send().expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Username must be alphanumeric characters, and '_' or '-' Password must be between 6 and 64 characters`,
    });
  });

  it("The length voliation when signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("The illegal character when signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("The existed username when signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    const response2 = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(400);
  });

  it("Send not json data when signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send("test")
      .expect(400);
  });
});

describe("Illegal input test when login", () => {
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  let token;

  it("The empty input", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send()
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Username must be alphanumeric characters, and '_' or '-' Password must be between 6 and 64 characters`,
    });
  });

  it("The length voliation when login", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("The illegal character when login", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("The not existed username when login", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "testuser", password: "testpassword" })
      .expect(401);
  });
});

describe("Illegal input test when update", () => {
  let token;
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);
    token = response.body.token;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("The empty input", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(400);
  });

  it("The length voliation when update", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("The illegal character when update", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("The not existed admin code when update", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ adminCode: "a" })
      .expect(400);
  });

  it("The not existed user when update", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}2`)
      .send({ username: "testuser2" })
      .expect(401);
  });

  it("No token when update", async () => {
    const response = await request(app).put("/api/user").send().expect(401);
  });
});

describe("Illegal input test when delete", () => {
  let token;
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("The not existed user when delete", async () => {
    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", `Bearer 2`)
      .expect(401);
  });

  it("No token when delete", async () => {
    const response = await request(app).delete("/api/user").expect(401);
  });
});

describe("Illegal input test when get", () => {
  let token;
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);
    token = response.body.token;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("The not existed user when get", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer 2`)
      .expect(401);
  });

  it("No token when get", async () => {
    const response = await request(app).get("/api/user").expect(401);
  });
});
