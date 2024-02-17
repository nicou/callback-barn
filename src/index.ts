import { Handler, APIGatewayProxyEventV2 } from "aws-lambda";
import { handleNewInvocation } from "./routes/new-invocation";
import { handleGetInvocation } from "./routes/get-invocation";
import { StatusCodes } from "./utils/http-status-codes";
import { isAuthenticated } from "./utils/auth";
import { jsonResponse } from "./utils/response";

type ProxyHandler = Handler<APIGatewayProxyEventV2, unknown>;

const INVOKE_PATH = "/invoke/";
const GET_INVOCATIONS_PATH = "/invocations/";

export const handler: ProxyHandler = async (event) => {
  if (!isAuthenticated(event)) {
    return jsonResponse({ error: "Unauthorized" }, StatusCodes.UNAUTHORIZED);
  }

  const path = event.rawPath;
  const listenerId = event.pathParameters?.listenerId?.trim();
  const method = event.requestContext.http.method;

  if (path.startsWith(INVOKE_PATH) && listenerId) {
    const response = await handleNewInvocation(listenerId, event);
    return jsonResponse(response, StatusCodes.CREATED);
  }

  if (method === "GET" && path.startsWith(GET_INVOCATIONS_PATH) && listenerId) {
    const response = await handleGetInvocation(listenerId);
    return jsonResponse(response);
  }

  return jsonResponse({ error: "Not found" }, StatusCodes.NOT_FOUND);
};
