<img src="https://github.com/nicou/callback-barn/assets/16757571/9e47fecb-1803-46c6-9999-c0ebd3af7c94" width="200" height="200" align="right" alt="callback-barn logo">

# callback-barn
*callback-barn* is a utility designed to support end-to-end testing for asynchronous tasks that utilize HTTP callbacks. It captures HTTP request details such as method, headers, body, and timestamp, storing them in DynamoDB for later retrieval and validation. This functionality is particularly useful for confirming the behavior of callback mechanisms in integrated testing scenarios.

## Usage

### Authentication
To enable authentication within *callback-barn*, simply set a value for API_KEY in the .env file before deployment. Once set, all incoming requests must include a corresponding `?token={API_KEY}` query parameter for verification. If no API_KEY is established, the application will disregard the token parameter, allowing requests without authentication.

### Deployment
To deploy *callback-barn* to AWS, execute the command `npm run deploy`. This operation will set up a new DynamoDB table and establish a single AWS Lambda function, which is connected to two HTTP API Gateway endpoints:

* `ANY /invoke/{listenerId}?token={API_KEY}`
  * This endpoint is designed to log incoming requests into DynamoDB. You can assign any value to listenerId, such as a UUID string, which acts as a unique identifier for the listener.
* `GET /invocations/{listenerId}?token={API_KEY}`
  * Accessing this endpoint retrieves a collection of recorded invocations associated with the specified listenerId. The data retrieved includes the request's body, headers, and timestamp.

The system is configured to handle and has been verified to work with JSON and plaintext formats for request bodies.

### Example usage scenario
This example uses the Node test runner to start an asynchronous task and then waits for a callback from the task. The callback is then validated.

```js
import { describe, it } from "node:test";
import assert from "node:assert";

const CALLBACK_BARN_URL = process.env.CALLBACK_BARN_URL;
const CALLBACK_BARN_TOKEN = process.env.CALLBACK_BARN_TOKEN;

const sleepFiveSeconds = () =>
  new Promise((resolve) => setTimeout(resolve, 5 * 1000));

describe("Asynchronous task", async () => {
  const listenerId = "123"; // Replace this with something generated, like a UUID

  const callbackUrl = `${CALLBACK_BARN_URL}/invoke/${listenerId}?token=${CALLBACK_BARN_TOKEN}`;

  // Start the asynchronous task that you are testing
  await fetch("http://example.com/asynchronous-task", {
    method: "POST",
    body: JSON.stringify({ callbackUrl }),
    headers: { "Content-Type": "application/json" },
  });

  it("should call the callback URL", async () => {
    let invocations = [];
    let retries = 0;

    // Poll the Callback Barn API for invocations
    while (invocations.length === 0 && retries < 10) {
      await sleepFiveSeconds(5);
      const getInvocationsUrl = `${CALLBACK_BARN_URL}/invocations/${listenerId}?token=${CALLBACK_BARN_TOKEN}`;
      const response = await fetch(getInvocationsUrl);
      invocations = await response.json();
      retries++;
    }

    // Perform your assertions
    assert.strictEqual(invocations.length, 1);
    assert.strictEqual(invocations[0].method, "POST");
    assert.strictEqual(invocations[0].body.status, "success");
  });
});
```
