import serverlessExpress from "@vendia/serverless-express";
import app from "./server";

let serverlessExpressInstance: any;

async function setup(event: unknown, context: unknown) {
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

export function handler(event: unknown, context: unknown) {
  if (serverlessExpressInstance)
    return serverlessExpressInstance(event, context);

  return setup(event, context);
}
