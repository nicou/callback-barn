import { StatusCodes } from "./http-status-codes";

export const jsonResponse = (
  body: any,
  statusCode: number = StatusCodes.OK
) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    "Content-Type": "application/json",
  },
});
