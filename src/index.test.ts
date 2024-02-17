import { describe, it, vi, expect, beforeAll, afterAll } from "vitest";
import { handler as lambdaHandler } from "./index";

const mockListenerInvocation = {
  listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
  createdAt: "2021-03-09T00:00:00.000Z",
  headers: {
    "Content-Type": "application/json",
  },
  method: "POST",
  body: {
    greeting: "hello world",
  },
};

const mockGetListenerInvocations = vi
  .fn()
  .mockResolvedValue([mockListenerInvocation]);
const mockInsertListenerInvocation = vi.fn().mockResolvedValue(undefined);
vi.mock("./integrations/aws/dynamodb", () => ({
  getListenerInvocations: (...args: any[]) =>
    mockGetListenerInvocations(...args),
  insertListenerInvocation: (...args: any[]) =>
    mockInsertListenerInvocation(...args),
}));

interface BuildEventParams {
  method: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  rawPath: string;
}

const buildEvent = (params: BuildEventParams) => ({
  pathParameters: params.pathParameters,
  queryStringParameters: params.queryStringParameters,
  rawPath: params.rawPath,
  requestContext: {
    http: {
      method: params.method,
    },
  },
});

const context = {} as any;
const callback = () => {};
const handler = (event: any) => lambdaHandler(event, context, callback);

describe("handler", () => {
  let originalApiKey: string | undefined;
  beforeAll(() => {
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = "api-key-123";
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  describe("authenticated", () => {
    const queryStringParameters = {
      token: "api-key-123",
    };

    describe("GET /invocations/:id", () => {
      let response: any;
      beforeAll(async () => {
        vi.clearAllMocks();
        const event = buildEvent({
          method: "GET",
          pathParameters: {
            listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          },
          rawPath: "/invocations/887635c9-dc7d-4b98-993d-ee6113cd4d98",
          queryStringParameters,
        });
        response = await handler(event);
      });

      it("should return HTTP 200", () => {
        expect(response.statusCode).toBe(200);
      });

      it("should return a JSON response", () => {
        expect(response.headers["Content-Type"]).toBe("application/json");
      });

      it("should return the listener invocation", () => {
        expect(JSON.parse(response.body)).toEqual([mockListenerInvocation]);
      });

      it("should call DynamoDB.getListenerInvocations", () => {
        expect(mockGetListenerInvocations).toHaveBeenCalledWith(
          "887635c9-dc7d-4b98-993d-ee6113cd4d98"
        );
      });
    });

    describe("POST /invoke/:id", () => {
      let response: any;
      beforeAll(async () => {
        const event = buildEvent({
          method: "POST",
          pathParameters: {
            listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          },
          queryStringParameters,
          rawPath: "/invoke/887635c9-dc7d-4b98-993d-ee6113cd4d98",
        });
        response = await handler(event);
      });

      it("should return HTTP 201", () => {
        expect(response.statusCode).toBe(201);
      });

      it("should return a JSON response", () => {
        expect(response.headers["Content-Type"]).toBe("application/json");
      });

      it("should return id and status", () => {
        expect(JSON.parse(response.body)).toEqual({
          id: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          status: "OK",
        });
      });
    });

    describe("Unsupported route", () => {
      it("should return HTTP 404", async () => {
        const event = buildEvent({
          method: "GET",
          rawPath: "/unsupported",
          queryStringParameters,
        });
        const response: any = await handler(event);
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({ error: "Not found" });
      });
    });
  });

  describe("unauthenticated", () => {
    describe("GET /invocations/:id", () => {
      it("should return HTTP 401", async () => {
        const event = buildEvent({
          method: "GET",
          pathParameters: {
            listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          },
          rawPath: "/invocations/887635c9-dc7d-4b98-993d-ee6113cd4d98",
        });
        const response: any = await handler(event);
        expect(response.statusCode).toBe(401);
      });
    });

    describe("POST /invoke/:id", () => {
      it("should return HTTP 401", async () => {
        const event = buildEvent({
          method: "POST",
          pathParameters: {
            listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          },
          rawPath: "/invoke/887635c9-dc7d-4b98-993d-ee6113cd4d98",
        });
        const response: any = await handler(event);
        expect(response.statusCode).toBe(401);
      });
    });
  });

  describe("authentication disabled", () => {
    let originalApiKey: string | undefined;

    beforeAll(() => {
      originalApiKey = process.env.API_KEY;
      delete process.env.API_KEY;
    });

    afterAll(() => {
      process.env.API_KEY = originalApiKey;
    });

    it("should function normally without an auth token", async () => {
      const event = buildEvent({
        method: "GET",
        rawPath: "/unsupported",
      });
      const response: any = await handler(event);
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: "Not found" });
    });
  });
});
