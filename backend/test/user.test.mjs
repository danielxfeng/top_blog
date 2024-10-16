/**
 * The test for the user management.
 * Have not test the OAuth part.
 */
import request from "supertest";
import { expect } from "chai";
import { app, prisma } from "../app.mjs";

describe("A normal user from registion to deletion", () => {
  before(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "BlogUser", "BlogOauthUser" CASCADE;`;
  });

  after(async () => {
    await prisma.$disconnect();
  });

  let token;
  let id;

  it("Returns 201 when a new user is registed", async () => {
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
    });
    expect(response.body.id).to.be.a("number");
    expect(response.body.token).to.be.a("string");

    id = response.body.id;
    token = response.body.token;
  });

  it("Returns 200 when get a user", async () => {
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

  it("Returns 200 with the same token when log in a user", async () => {
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

  it("Returns 200 with new token when username is updated", async () => {
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

  it("Returns 200 with new token when isAdmin status changed, and returns 401 when tried old token", async () => {
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

  it("Returns 200 with same token when updated the password", async () => {
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

  it("Returns 204 after deleted a user, and 401 when tried to log in with old token.", async () => {
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

  it("Returns 400 when try the empty input", async () => {
    const response = await request(app).post("/api/user").send().expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Username must be alphanumeric characters, and '_' or '-' Password must be between 6 and 64 characters`,
    });
  });

  it("Returns 400 when signup with invalid length", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("Returns 400 when signup with illegal characters", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("Returns 400 when signup with existed user", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(201);

    const response2 = await request(app)
      .post("/api/user")
      .send({ username: "testuser", password: "testpassword" })
      .expect(400);
  });

  it("Returns 400 when signup with invalid data", async () => {
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

  it("Returns 400 when try the empty input", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send()
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Username must be alphanumeric characters, and '_' or '-' Password must be between 6 and 64 characters`,
    });
  });

  it("Returns 400 when login with the length voliation", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("Returns 400 when login with the illegal character", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("Returns 400 when login with not existed user", async () => {
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

  it("Returns 400 when try the empty input", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send()
      .expect(400);
  });

  it("Returns 400 when update with the length voliation", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "a", password: "a" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be between 6 and 64 characters Password must be between 6 and 64 characters`,
    });
  });

  it("Returns 400 when update with the illegal character", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "testuser!", password: "testpassword" })
      .expect(400);

    expect(response.body).to.deep.equal({
      message: `Username must be alphanumeric characters, and '_' or '-'`,
    });
  });

  it("Returns 400 when update with invalid adminCode", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({ adminCode: "a" })
      .expect(400);
  });

  it("Returns 401 when update with the not existed user", async () => {
    const response = await request(app)
      .put("/api/user")
      .set("Authorization", `Bearer ${token}2`)
      .send({ username: "testuser2" })
      .expect(401);
  });

  it("Returns 401 when update without the token", async () => {
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

  it("Returns 401 when delete with a non existed user", async () => {
    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", `Bearer 2`)
      .expect(401);
  });

  it("Returns 401 when delete without token", async () => {
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

  it("Returns 401 when get with not existed user", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer 2`)
      .expect(401);
  });

  it("Returns 401 when get without token", async () => {
    const response = await request(app).get("/api/user").expect(401);
  });
});
