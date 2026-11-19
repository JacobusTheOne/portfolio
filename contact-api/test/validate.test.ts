import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDigest, validate } from "../lambda/validate.ts";

const now = 1_800_000_000_000;
const body = (o: object) => JSON.stringify({ name: "Ada", email: "Ada@Example.com", message: "Hello, I'd like to chat.", loadedAt: now - 10_000, ...o });

test("accepts a normal message and normalizes the email", () => {
  const r = validate(body({}), now);
  assert.deepEqual(r, { kind: "ok", contact: { name: "Ada", email: "ada@example.com", message: "Hello, I'd like to chat." } });
});

test("honeypot and too-fast submissions are treated as spam", () => {
  assert.equal(validate(body({ company: "http://spam" }), now).kind, "spam");
  assert.equal(validate(body({ loadedAt: now - 500 }), now).kind, "spam");
  assert.equal(validate(body({ loadedAt: "nope" }), now).kind, "spam");
});

test("rejects bad input", () => {
  for (const b of [undefined, "", "not json", "[]", "null", "x".repeat(20_001)]) assert.equal(validate(b, now).kind, "invalid", String(b).slice(0, 20));
  assert.equal(validate(body({ name: "  " }), now).kind, "invalid");
  assert.equal(validate(body({ name: "n".repeat(101) }), now).kind, "invalid");
  assert.equal(validate(body({ email: "nope" }), now).kind, "invalid");
  assert.equal(validate(body({ email: "a@b" }), now).kind, "invalid");
  assert.equal(validate(body({ message: "short" }), now).kind, "invalid");
  assert.equal(validate(body({ message: "m".repeat(5001) }), now).kind, "invalid");
  assert.equal(validate(body({ name: 42 }), now).kind, "invalid");
});

test("strips control characters but keeps newlines", () => {
  const r = validate(body({ message: "Line one\r\nLine\u0007 two\u0000" }), now);
  assert.equal(r.kind === "ok" && r.contact.message, "Line one\nLine two");
});

test("digest formatting", () => {
  const m = { name: "Ada", email: "ada@example.com", message: "Hi there friend", createdAt: "2026-11-19T12:00:00.000Z" };
  const one = formatDigest([m]);
  assert.equal(one.subject, "Portfolio: 1 new message");
  assert.match(one.body, /From:    Ada <ada@example.com>/);
  assert.equal(formatDigest([m, m]).subject, "Portfolio: 2 new messages");
  const big = formatDigest(Array(50).fill({ ...m, message: "x".repeat(1000) }), 5000);
  assert.ok(big.body.length < 6000 && /more not shown/.test(big.body));
  assert.ok(one.subject.length <= 100);
});
