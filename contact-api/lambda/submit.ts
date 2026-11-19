import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { validate } from "./validate.ts";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;
const RETENTION_DAYS = 365;

const reply = (statusCode: number, body: object): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const raw = event.isBase64Encoded && event.body ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
  const result = validate(raw);

  if (result.kind === "invalid") return reply(400, { ok: false, error: result.error });
  if (result.kind === "spam") {
    console.log(JSON.stringify({ msg: "spam dropped" }));
    return reply(200, { ok: true });
  }

  const now = new Date();
  try {
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: "MSG",
        // Time-first sort key: the digest reads "everything since last run" with one Query.
        sk: `${now.toISOString()}#${randomUUID()}`,
        ...result.contact,
        createdAt: now.toISOString(),
        expiresAt: Math.floor(now.getTime() / 1000) + RETENTION_DAYS * 86_400,
      },
    }));
  } catch (err) {
    console.error(JSON.stringify({ msg: "save failed", error: String(err) }));
    return reply(500, { ok: false, error: "Sorry, your message couldn't be saved. Please try again later." });
  }
  console.log(JSON.stringify({ msg: "message saved" })); // no personal data in logs
  return reply(200, { ok: true });
};
