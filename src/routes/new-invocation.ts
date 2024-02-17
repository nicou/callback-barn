import { APIGatewayProxyEventV2 } from "aws-lambda";
import { insertListenerInvocation } from "../integrations/aws/dynamodb";
import { NewInvocationResponse } from "../types";

export const handleNewInvocation = async (
  listenerId: string,
  event: APIGatewayProxyEventV2
): Promise<NewInvocationResponse> => {
  const { body, headers, requestContext } = event;
  const method = requestContext.http.method;
  await insertListenerInvocation({
    listenerId,
    body,
    headers,
    method,
  });
  return { id: listenerId, status: "OK" };
};
