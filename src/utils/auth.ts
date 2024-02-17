import { APIGatewayProxyEventV2 } from "aws-lambda";

export const isAuthenticated = (event: APIGatewayProxyEventV2): boolean => {
  const { API_KEY } = process.env;
  if (!API_KEY) return true;

  return event.queryStringParameters?.token === API_KEY;
};
