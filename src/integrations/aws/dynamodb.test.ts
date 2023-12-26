import * as AWS from "aws-sdk";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { getListenerInvocations, insertListenerInvocation } from "./dynamodb";
import { IncomingHttpHeaders } from "http";

vi.mock("aws-sdk", () => {
  const mDocumentClient = {
    query: vi.fn(),
    put: vi.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: vi.fn(() => mDocumentClient),
    },
    config: {
      update: vi.fn(),
    },
  };
});

const mDocClient = new AWS.DynamoDB.DocumentClient();

describe("ListenerInvocations", () => {
  beforeEach(() => {
    vi.mocked(mDocClient.query).mockReset();
    vi.mocked(mDocClient.put).mockReset();
  });

  describe("getListenerInvocations", () => {
    it("should return an array of listener invocations", async () => {
      const listenerId = "test-listener";
      const mockItems: any[] = [
        {
          listenerId,
          createdAt: new Date().toISOString(),
          headers: {},
          body: {},
        },
      ];
      vi.mocked(mDocClient.query).mockReturnValue({
        promise: vi.fn().mockResolvedValue({ Items: mockItems }),
      } as any);

      const result = await getListenerInvocations(listenerId);
      expect(result).toEqual(mockItems);
      expect(mDocClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "callback-barn-invocations",
          KeyConditionExpression: "listenerId = :listenerId",
          ExpressionAttributeValues: {
            ":listenerId": listenerId,
          },
        })
      );
    });
  });

  describe("insertListenerInvocation", () => {
    it("should insert a listener invocation", async () => {
      const listenerId = "test-insert";
      const body = { data: "test" };
      const headers: IncomingHttpHeaders = {
        "content-type": "application/json",
      };

      vi.mocked(mDocClient.put).mockReturnValue({
        promise: vi.fn().mockResolvedValue({}),
      } as any);

      await insertListenerInvocation(listenerId, body, headers);
      expect(mDocClient.put).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "callback-barn-invocations",
          Item: expect.objectContaining({
            listenerId,
            body,
            headers,
          }),
        })
      );
    });
  });
});
