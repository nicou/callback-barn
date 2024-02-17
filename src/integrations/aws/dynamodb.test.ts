import { QueryCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { getListenerInvocations, insertListenerInvocation } from "./dynamodb";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-dynamodb", async () => {
  const actual = await vi.importActual("@aws-sdk/client-dynamodb");
  return {
    ...actual,
    DynamoDBClient: vi.fn(() => ({
      send: (...args: any[]) => mockSend(...args),
    })),
  };
});

describe("ListenerInvocations", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  describe("getListenerInvocations", () => {
    it("should return an array of listener invocations", async () => {
      const listenerId = "test-listener";
      const mockItems = [
        {
          listenerId: { S: listenerId },
          createdAt: { S: new Date().toISOString() },
          headers: { S: "{}" },
          method: { S: "POST" },
          body: { S: "{}" },
        },
      ];
      mockSend.mockResolvedValueOnce({ Items: mockItems });

      const result = await getListenerInvocations(listenerId);
      expect(result).toEqual(
        mockItems.map((item) => ({
          listenerId: item.listenerId.S,
          createdAt: item.createdAt.S,
          headers: {},
          method: item.method.S,
          body: {},
        }))
      );
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
      // Further assertions can be made here to check the parameters of the QueryCommand
    });
  });

  describe("insertListenerInvocation", () => {
    it("should insert a listener invocation", async () => {
      const listenerId = "test-insert";
      const body = JSON.stringify({ data: "test" });
      const method = "POST";
      const headers = {
        "content-type": "application/json",
      };

      mockSend.mockResolvedValueOnce({});

      await insertListenerInvocation({ listenerId, body, headers, method });
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutItemCommand));
      const [command] = mockSend.mock.calls[0];
      expect(command.input.TableName).toBe("callback-barn-invocations");
      expect(command.input.Item.listenerId.S).toBe(listenerId);
      expect(command.input.Item.body.S).toBe(body);
      expect(command.input.Item.method.S).toBe(method);
      expect(command.input.Item.headers.S).toBe(JSON.stringify(headers));
    });
  });
});
