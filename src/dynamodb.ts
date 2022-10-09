import * as AWS from "aws-sdk";
import { IncomingHttpHeaders } from "http";

AWS.config.update({ region: "eu-west-1" });

const docClient = new AWS.DynamoDB.DocumentClient();
const TableName = "callback-barn-invocations";

interface ListenerInvocation {
  listenerId: string;
  createdAt: string; // ISO 8601 formatted date
  headers: Record<string, unknown>;
  body: unknown;
}

export async function getListenerInvocations(
  listenerId: string
): Promise<ListenerInvocation[]> {
  const params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName,
    KeyConditionExpression: "listenerId = :listenerId",
    ExpressionAttributeValues: {
      ":listenerId": listenerId,
    },
  };

  const result = await docClient.query(params).promise();
  return (result.Items || []) as ListenerInvocation[];
}

export async function insertListenerInvocation(
  listenerId: string,
  body: unknown,
  headers: IncomingHttpHeaders
): Promise<void> {
  const params = {
    TableName,
    Item: {
      createdAt: new Date().toISOString(),
      listenerId,
      body,
      headers,
    },
  };

  await docClient.put(params).promise();
}
