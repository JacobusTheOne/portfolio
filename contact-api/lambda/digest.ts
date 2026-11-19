import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { formatDigest, type Contact } from "./validate.ts";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const TOPIC_ARN = process.env.TOPIC_ARN!;
const STATE_KEY = { pk: "STATE", sk: "digest" };

export const handler = async () => {
  const runStart = new Date().toISOString();
  const state = await db.send(new GetCommand({ TableName: TABLE_NAME, Key: STATE_KEY }));
  const since: string = state.Item?.lastRunAt ?? "1970-01-01T00:00:00.000Z";

  // Sort keys start with an ISO timestamp, so this range is "since the last successful run".
  // Messages arriving during this run sort after runStart and are picked up tomorrow.
  const items: (Contact & { createdAt: string })[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const page = await db.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND sk BETWEEN :from AND :to",
      ExpressionAttributeValues: { ":pk": "MSG", ":from": since, ":to": runStart },
      ExclusiveStartKey,
    }));
    items.push(...((page.Items ?? []) as (Contact & { createdAt: string })[]));
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  if (items.length > 0) {
    const { subject, body } = formatDigest(items);
    await sns.send(new PublishCommand({ TopicArn: TOPIC_ARN, Subject: subject, Message: body }));
  }

  // Only advance after a successful publish, so a failed run is retried by the next one.
  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: { ...STATE_KEY, lastRunAt: runStart } }));
  console.log(JSON.stringify({ msg: "digest done", newMessages: items.length }));
  return { newMessages: items.length };
};
