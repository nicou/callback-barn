<img src="https://github.com/nicou/callback-barn/assets/16757571/9e47fecb-1803-46c6-9999-c0ebd3af7c94" width="200" height="200" align="right" alt="callback-barn logo">

# callback-barn
A very simple app that stores HTTP requests (method, headers, body and timestamp) made to it into DynamoDB and allows you to get them later. The use case I made this for is catching and then validating callback requests made during end-to-end testing.

## Usage

### Authentication
If you want to use authentication, define `API_KEY` in .env file. This will require a matching `?token={API_KEY}` query parameter to be present in all requests. If `API_KEY` is not defined, the `token` query parameter will be ignored.

### Deployment
Run `npm run deploy` to deploy callback-barn to AWS. Deploying the application will create a DynamoDB table and a single Lambda function with two HTTP API Gateway endpoints:

- `ANY /invoke/{listenerId}?token={API_KEY}` will save the request into DynamoDB. `listenerId` is something that you can just make up, e.g. an uuid string.
- `GET /invocations/{listenerId}?token={API_KEY}` will return an array of all invocations for the given `listenerId`, including request body, headers and timestamp.

JSON and plaintext request bodies are supported and have been tested. Other type of request bodies (e.g. form data) will also be stored to DynamoDB but probably not in an ideal format.
