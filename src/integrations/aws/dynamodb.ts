import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { SavedInvocation } from "../../types";
import { safeParseJsonValue } from "../../utils/json";

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const dynamodb = new DynamoDBClient({ region });
const TableName = "callback-barn-invocations";

const mapResult = (
  result: Record<string, AttributeValue>
): Partial<SavedInvocation> => ({
  createdAt: result.createdAt.S,
  listenerId: result.listenerId.S,
  headers: safeParseJsonValue(result.headers.S),
  method: result.method?.S,
  body: safeParseJsonValue(result.body?.S),
});

export async function getListenerInvocations(
  listenerId: string
): Promise<Partial<SavedInvocation>[]> {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: "listenerId = :listenerId",
    ExpressionAttributeValues: {
      ":listenerId": { S: listenerId },
    },
  });

  const result = await dynamodb.send(command);
  return (result.Items || []).map(mapResult);
}

interface InsertListenerInvocationParams {
  body: string | undefined;
  headers: Record<string, string | undefined>;
  method: string;
  listenerId: string;
}

export async function insertListenerInvocation({
  body,
  headers,
  method,
  listenerId,
}: InsertListenerInvocationParams): Promise<void> {
  const command = new PutItemCommand({
    TableName,
    Item: {
      createdAt: { S: new Date().toISOString() },
      listenerId: { S: listenerId },
      ...(body ? { body: { S: body } } : {}),
      method: { S: method },
      headers: { S: JSON.stringify(headers) },
    },
  });
  await dynamodb.send(command);
}
