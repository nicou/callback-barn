import { describe, it, vi, expect, beforeAll, afterAll } from "vitest";
import request, { Response } from "supertest";
import app from "./server";

const mockListenerInvocation = {
  listenerId: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
  createdAt: "2021-03-09T00:00:00.000Z",
  headers: {
    "Content-Type": "application/json",
  },
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

describe("server", () => {
  let originalApiKey: string | undefined;
  beforeAll(() => {
    originalApiKey = process.env.API_KEY;
    process.env.API_KEY = "api-key-123";
  });

  afterAll(() => {
    process.env.API_KEY = originalApiKey;
  });

  describe("authenticated", () => {
    describe("GET /:id", () => {
      let response: Response;
      beforeAll(async () => {
        vi.clearAllMocks();
        response = await request(app)
          .get("/887635c9-dc7d-4b98-993d-ee6113cd4d98")
          .query({
            token: "api-key-123",
          });
      });

      it("should return HTTP 200", () => {
        expect(response.status).toBe(200);
      });

      it("should return a JSON response", () => {
        expect(response.type).toBe("application/json");
      });

      it("should return the listener invocation", () => {
        expect(response.body).toEqual([mockListenerInvocation]);
      });

      it("should call DynamoDB.getListenerInvocations", () => {
        expect(mockGetListenerInvocations).toHaveBeenCalledWith(
          "887635c9-dc7d-4b98-993d-ee6113cd4d98"
        );
      });
    });

    describe("POST /:id", () => {
      let response: Response;
      beforeAll(async () => {
        response = await request(app)
          .post("/887635c9-dc7d-4b98-993d-ee6113cd4d98")
          .send({ greeting: "hello world" })
          .query({
            token: "api-key-123",
          });
      });

      it("should return HTTP 201", () => {
        expect(response.status).toBe(201);
      });

      it("should return a JSON response", () => {
        expect(response.type).toBe("application/json");
      });

      it("should return the listener invocation", () => {
        expect(response.body).toEqual({
          id: "887635c9-dc7d-4b98-993d-ee6113cd4d98",
          status: "OK",
        });
      });
    });
  });

  describe("unauthenticated", () => {
    describe("GET /:id", () => {
      it("should return HTTP 401", async () => {
        const response = await request(app).get(
          "/887635c9-dc7d-4b98-993d-ee6113cd4d98"
        );
        expect(response.status).toBe(401);
      });
    });

    describe("POST /:id", () => {
      it("should return HTTP 401", async () => {
        const response = await request(app)
          .post("/887635c9-dc7d-4b98-993d-ee6113cd4d98")
          .send({ greeting: "hello world" });
        expect(response.status).toBe(401);
      });
    });
  });
});
