import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

describe("health endpoint", () => {
  it("returns 200 with ok status", async () => {
    const res = await request(app).get("/health");

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
    assert.ok(res.body.timestamp);
  });
});

describe("unknown routes", () => {
  it("returns 404 for an unknown api route", async () => {
    const res = await request(app).get("/api/does-not-exist");

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, "Route not found");
  });
});

describe("auth validation", () => {
  it("rejects login with missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    assert.ok(res.status >= 400 && res.status < 500);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  it("rejects registration with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    assert.ok(res.status >= 400 && res.status < 500);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors.length > 0);
  });
});
