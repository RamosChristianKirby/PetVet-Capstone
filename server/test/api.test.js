import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app.js";
import { readConfig } from "../config.js";
import User from "../models/users.js";
import Pet from "../models/pets.js";
import Visit from "../models/visits.js";

const secret = "test-only-secret-with-more-than-32-characters";
const app = createApp({
  jwtSecret: secret,
  clientOrigins: ["http://localhost:5173"],
});
let mongo, owner, other, doctor, petId, visitId;
const auth = (token) => ({ Authorization: "Bearer " + token });
const profile = (email, name = "Test Owner") => ({
  name,
  email,
  contact: "09123456789",
  address: "Test address",
  password: "TestPass123!",
});
const petData = {
  name: "Mochi",
  petType: "dog",
  breed1: "Aspin",
  breed2: "",
  dob: "2020-01-01",
  rfidNumber: "00123",
  contact: "09123456789",
  address: "Test address",
};
before(
  async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await Promise.all([User.init(), Pet.init(), Visit.init()]);
    owner = (
      await request(app)
        .post("/api/users/signup")
        .send(profile("owner@example.test"))
    ).body;
    other = (
      await request(app)
        .post("/api/users/signup")
        .send(profile("other@example.test"))
    ).body;
    const staff = await User.create({
      ...profile("doctor@example.test", "Dr. Rivera"),
      role: "doctor",
    });
    doctor = jwt.sign({ id: staff.id }, secret, { expiresIn: "1h" });
  },
  { timeout: 180000 },
);
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

test("configuration rejects missing or weak credentials", () => {
  assert.throws(() => readConfig({}), /MONGODB_URI/);
  assert.throws(
    () =>
      readConfig({
        MONGODB_URI: "mongodb://localhost/test",
        JWT_SECRET: "short",
      }),
    /JWT_SECRET/,
  );
});
test("health, headers, CORS, malformed JSON, and unknown routes", async () => {
  const health = await request(app).get("/api/health").expect(200);
  assert.equal(health.body.status, "ok");
  assert.equal(health.headers["x-powered-by"], undefined);
  assert.equal(health.headers["cache-control"], "no-store");
  await request(app)
    .get("/api/health")
    .set("Origin", "https://untrusted.example")
    .expect(403);
  await request(app)
    .post("/api/users/login")
    .set("Content-Type", "application/json")
    .send("{broken")
    .expect(400);
  await request(app).get("/not-a-route").expect(404);
});
test("signup normalizes email, ignores roles, includes ID, and never exposes password", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ ...profile("  NEW@EXAMPLE.TEST  "), role: "doctor" })
    .expect(201);
  assert.equal(response.body.result.email, "new@example.test");
  assert.equal(response.body.result.role, "pet_owner");
  assert.ok(response.body.result.id);
  assert.equal(response.body.result.password, undefined);
  await request(app)
    .post("/api/users/signup")
    .send(profile("new@example.test"))
    .expect(409);
});
test("invalid and injected credentials fail; login returns safe profile", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ ...profile("bad@example.test"), password: "short" })
    .expect(400);
  await request(app)
    .post("/api/users/login")
    .send({ email: { $ne: null }, password: "anything" })
    .expect(400);
  await request(app)
    .post("/api/users/login")
    .send({ email: "owner@example.test", password: "wrong" })
    .expect(401);
  const response = await request(app)
    .post("/api/users/login")
    .send({ email: "OWNER@EXAMPLE.TEST", password: "TestPass123!" })
    .expect(200);
  assert.equal(response.body.result.password, undefined);
});
test("authentication and directory permissions are enforced", async () => {
  await request(app).get("/api/users").expect(401);
  await request(app).get("/api/users").set(auth(owner.token)).expect(403);
  const response = await request(app)
    .get("/api/users")
    .set(auth(doctor))
    .expect(200);
  assert.ok(
    response.body.every((user) => !user.password && user.role === "pet_owner"),
  );
  const expired = jwt.sign({ id: owner.result.id }, secret, { expiresIn: -1 });
  await request(app).get("/api/pets").set(auth(expired)).expect(401);
  await request(app).get("/api/pets").set(auth("bad-token")).expect(401);
});
test("registering a pet preserves RFID zeros and rejects forged ownership or clinical data", async () => {
  await request(app)
    .post("/api/pets")
    .set(auth(owner.token))
    .send({ ...petData, ownerId: other.result.id })
    .expect(403);
  await request(app)
    .post("/api/pets")
    .set(auth(owner.token))
    .send({
      ...petData,
      vaccinationHistory: [{ date: "2024-01-01", vaccinationType: "Rabies" }],
    })
    .expect(403);
  const response = await request(app)
    .post("/api/pets")
    .set(auth(owner.token))
    .send(petData)
    .expect(201);
  petId = response.body._id;
  assert.equal(response.body.rfidNumber, "00123");
  assert.equal(response.body.ownerId._id, owner.result.id);
  assert.equal(response.body.ownerId.password, undefined);
  await request(app)
    .post("/api/pets")
    .set(auth(owner.token))
    .send(petData)
    .expect(409);
  await request(app)
    .post("/api/pets")
    .set(auth(owner.token))
    .send({ ...petData, rfidNumber: "00234", dob: "2999-01-01" })
    .expect(400);
});
test("pet detail, list, owner filter, RFID, and edits respect ownership", async () => {
  await request(app)
    .get("/api/pet/" + petId)
    .set(auth(owner.token))
    .expect(200);
  await request(app)
    .get("/api/pet/not-an-id")
    .set(auth(owner.token))
    .expect(400);
  await request(app)
    .get("/api/pet/" + petId)
    .set(auth(other.token))
    .expect(404);
  const list = await request(app)
    .get("/api/pets")
    .set(auth(other.token))
    .expect(200);
  assert.deepEqual(list.body, []);
  await request(app)
    .get("/api/pets/owner?ownerId=" + owner.result.id)
    .set(auth(other.token))
    .expect(403);
  await request(app).get("/api/pets/rfid/00123").expect(401);
  await request(app)
    .get("/api/pets/rfid/00123")
    .set(auth(other.token))
    .expect(404);
  const scan = await request(app)
    .get("/api/pets/rfid/00123")
    .set(auth(doctor))
    .expect(200);
  assert.equal(scan.body.petName, "Mochi");
  await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(other.token))
    .send({ name: "stolen" })
    .expect(404);
  await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(owner.token))
    .send({ vaccinationHistory: [] })
    .expect(403);
  await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(owner.token))
    .send({ status: "wrong" })
    .expect(400);
  await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(owner.token))
    .send({ version: 999, name: "changed" })
    .expect(409);
});
test("profile updates cannot grant roles or overwrite passwords", async () => {
  await request(app)
    .put("/api/users/" + other.result.id)
    .set(auth(owner.token))
    .send({ name: "Hacked" })
    .expect(403);
  const response = await request(app)
    .put("/api/users/" + owner.result.id)
    .set(auth(owner.token))
    .send({ name: "Updated Owner", role: "doctor", password: "plaintext" })
    .expect(200);
  assert.equal(response.body.role, "pet_owner");
  assert.equal(response.body.password, undefined);
  await request(app)
    .post("/api/users/login")
    .send({ email: "owner@example.test", password: "TestPass123!" })
    .expect(200);
});
test("remarks persist and private notes remain restricted through all response paths", async () => {
  await request(app)
    .post("/api/pets/comment")
    .set(auth(owner.token))
    .send({ petId, content: "Forbidden", isPublic: false })
    .expect(403);
  await request(app)
    .post("/api/pets/comment")
    .set(auth(doctor))
    .send({ petId, content: "Private note", isPublic: false })
    .expect(201);
  await request(app)
    .post("/api/pets/comment")
    .set(auth(doctor))
    .send({ petId, content: "Shared care update", isPublic: true })
    .expect(201);
  const comments = await request(app)
    .get("/api/pets/" + petId + "/comments")
    .set(auth(owner.token))
    .expect(200);
  assert.deepEqual(comments.body.doctorComments, []);
  assert.equal(comments.body.publicComments[0].author.name, "Dr. Rivera");
  const detail = await request(app)
    .get("/api/pet/" + petId)
    .set(auth(owner.token))
    .expect(200);
  assert.deepEqual(detail.body.doctorComments, []);
  const update = await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(owner.token))
    .send({ name: "Mochi Updated" })
    .expect(200);
  assert.deepEqual(update.body.doctorComments, []);
  const staff = await request(app)
    .get("/api/pets/" + petId + "/comments")
    .set(auth(doctor))
    .expect(200);
  assert.equal(staff.body.doctorComments.length, 1);
  await request(app)
    .delete(
      "/api/pets/comments/" + staff.body.doctorComments[0]._id + "/" + petId,
    )
    .set(auth(doctor))
    .expect(200);
});
test("vaccination history round-trips and rejects bad dates", async () => {
  await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(doctor))
    .send({
      vaccinationHistory: [{ date: "2999-01-01", vaccinationType: "Rabies" }],
    })
    .expect(400);
  const response = await request(app)
    .put("/api/pets/details/" + petId)
    .set(auth(doctor))
    .send({
      vaccinationHistory: [{ date: "2024-01-01", vaccinationType: "Rabies" }],
    })
    .expect(200);
  assert.equal(response.body.vaccinationHistory.length, 1);
});
test("visits derive ownership from the pet and enforce update permissions", async () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  await request(app)
    .post("/api/visits")
    .set(auth(other.token))
    .send({ petId, date: future })
    .expect(404);
  await request(app)
    .post("/api/visits")
    .set(auth(owner.token))
    .send({ petId, date: "2020-01-01" })
    .expect(400);
  const response = await request(app)
    .post("/api/visits")
    .set(auth(owner.token))
    .send({ petId, date: future, ownerId: other.result.id, comment: "Checkup" })
    .expect(201);
  visitId = response.body._id;
  assert.equal(response.body.ownerId, owner.result.id);
  const list = await request(app)
    .get("/api/visits")
    .set(auth(other.token))
    .expect(200);
  assert.deepEqual(list.body, []);
  await request(app)
    .put("/api/visits/" + visitId)
    .set(auth(other.token))
    .send({ status: "cancelled" })
    .expect(404);
  await request(app)
    .put("/api/visits/" + visitId)
    .set(auth(owner.token))
    .send({ status: "completed" })
    .expect(403);
  await request(app)
    .put("/api/visits/" + visitId)
    .set(auth(doctor))
    .send({ status: "completed" })
    .expect(200);
  await request(app)
    .put("/api/visits/" + visitId)
    .set(auth(owner.token))
    .send({ status: "cancelled" })
    .expect(409);
});
test("archive hides records and visits while retaining the medical history", async () => {
  await request(app)
    .delete("/api/pets/" + petId)
    .set(auth(owner.token))
    .expect(403);
  await request(app)
    .delete("/api/pets/" + petId)
    .set(auth(doctor))
    .expect(200);
  await request(app)
    .get("/api/pet/" + petId)
    .set(auth(doctor))
    .expect(404);
  await request(app).get("/api/pets/rfid/00123").set(auth(doctor)).expect(404);
  const visits = await request(app)
    .get("/api/visits")
    .set(auth(doctor))
    .expect(200);
  assert.deepEqual(visits.body, []);
  assert.ok(await Pet.findById(petId));
  assert.ok(await Visit.findById(visitId));
});
test("roles are loaded from the database, not trusted from the token", async () => {
  const forgedRole = jwt.sign({ id: owner.result.id, role: "doctor" }, secret, {
    expiresIn: "1h",
  });
  await request(app).get("/api/users").set(auth(forgedRole)).expect(403);
});
test("login attempts are rate limited", async () => {
  const limited = createApp({ jwtSecret: secret });
  let response;
  for (let count = 0; count < 31; count++)
    response = await request(limited).post("/api/users/login").send({});
  assert.equal(response.status, 429);
});

test("calendar dates reject impossible days and accept the clinic current date", async () => {
  const { petInput } = await import("../lib/validation.js");
  assert.equal(
    petInput.safeParse({ ...petData, dob: "2025-02-31" }).success,
    false,
  );
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
  }).format(new Date());
  assert.equal(petInput.safeParse({ ...petData, dob: today }).success, true);
});

test("partial edits preserve optional fields instead of applying create defaults", async () => {
  const { petUpdate } = await import("../lib/validation.js");
  assert.deepEqual(petUpdate.parse({ name: "Updated" }), { name: "Updated" });
});

test("legacy migration is read-only by default, normalizes safely, and rejects collisions", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const execute = promisify(execFile);
  const db = mongoose.connection.useDb("migration-check");
  const users = db.collection("users");
  const pets = db.collection("pets");
  await users.insertOne({
    name: "Legacy Owner",
    email: "LEGACY@EXAMPLE.TEST",
    role: "pet_owner",
  });
  await users.createIndex({ name: 1 }, { unique: true, name: "name_1" });
  await pets.insertOne({ rfidNumber: "abc00123", status: "Active" });
  const env = {
    ...process.env,
    MONGODB_URI: mongo.getUri("migration-check"),
    JWT_SECRET: secret,
  };
  const script = fileURLToPath(
    new URL("../scripts/migrate.js", import.meta.url),
  );
  const run = (apply) =>
    execute(process.execPath, [script, ...(apply ? ["--apply"] : [])], { env });
  await run(false);
  assert.equal((await users.findOne()).email, "LEGACY@EXAMPLE.TEST");
  assert.equal((await pets.findOne()).status, "Active");
  await run(true);
  assert.equal((await users.findOne()).email, "legacy@example.test");
  assert.equal((await pets.findOne()).rfidNumber, "ABC00123");
  assert.equal((await pets.findOne()).status, "active");
  assert.ok(!(await users.indexes()).some((index) => index.name === "name_1"));
  await run(true);
  await users.insertOne({ name: "Duplicate", email: "LEGACY@EXAMPLE.TEST" });
  await assert.rejects(run(true), (error) => error.code === 1);
  assert.equal(await users.countDocuments(), 2);
});
