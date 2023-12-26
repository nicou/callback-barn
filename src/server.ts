import express from "express";
import StatusCodes from "http-status-codes";
import * as DynamoDB from "./integrations/aws/dynamodb";
import authenticationMiddleware from "./middleware/auth";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(express.text());
app.use(authenticationMiddleware);

app.get("/:listenerId", async (req, res) => {
  const invocations = await DynamoDB.getListenerInvocations(
    req.params.listenerId
  );
  res.json(invocations);
});

app.post("/:listenerId", async (req, res) => {
  const id = req.params.listenerId;
  const body = req.body;
  const headers = req.headers;
  await DynamoDB.insertListenerInvocation(id, body, headers);
  res.status(StatusCodes.CREATED).json({ id, status: "OK" });
});

export default app;
