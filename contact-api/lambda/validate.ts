// Pure validation for contact submissions (no AWS imports, so it is unit-testable).

export const LIMITS = { name: 100, email: 254, message: 5000, minMessage: 10, body: 20_000 };
/** Humans take longer than this between page load and submit; simple bots don't. */
export const MIN_FILL_MS = 3000;

export type Contact = { name: string; email: string; message: string };
export type Result =
  | { kind: "ok"; contact: Contact }
  | { kind: "spam" } // answered with a fake success so bots learn nothing
  | { kind: "invalid"; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Drop control characters except tab and newline.
const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim() : "";

export function validate(rawBody: string | undefined, now = Date.now()): Result {
  if (!rawBody || rawBody.length > LIMITS.body) return { kind: "invalid", error: "Message is too large." };

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(rawBody);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
  } catch {
    return { kind: "invalid", error: "Invalid request." };
  }

  // Honeypot field is hidden from people; anything in it means a bot.
  if (clean(input.company)) return { kind: "spam" };
  const loadedAt = Number(input.loadedAt);
  if (!Number.isFinite(loadedAt) || now - loadedAt < MIN_FILL_MS) return { kind: "spam" };

  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const message = clean(input.message);

  if (!name || name.length > LIMITS.name) return { kind: "invalid", error: "Please enter your name (up to 100 characters)." };
  if (email.length > LIMITS.email || !EMAIL.test(email)) return { kind: "invalid", error: "Please enter a valid email address." };
  if (message.length < LIMITS.minMessage) return { kind: "invalid", error: "Please write a slightly longer message." };
  if (message.length > LIMITS.message) return { kind: "invalid", error: "Message is too long (5000 characters max)." };

  return { kind: "ok", contact: { name, email, message } };
}

/** Builds the digest email text. Kept well under SNS's 256 KB message limit. */
export function formatDigest(items: (Contact & { createdAt: string })[], maxChars = 200_000) {
  const subject = `Portfolio: ${items.length} new message${items.length === 1 ? "" : "s"}`;
  let body = `You received ${items.length} new message${items.length === 1 ? "" : "s"} through your portfolio.\n`;
  for (const [i, m] of items.entries()) {
    const entry =
      `\n──────── ${i + 1} of ${items.length} ────────\n` +
      `From:    ${m.name} <${m.email}>\nWhen:    ${m.createdAt} (UTC)\n\n${m.message}\n`;
    if (body.length + entry.length > maxChars) {
      body += `\n…${items.length - i} more not shown (email size limit). See the DynamoDB table.\n`;
      break;
    }
    body += entry;
  }
  return { subject, body };
}
