<img src="https://user-images.githubusercontent.com/16757571/194772634-25be0883-d7e4-4604-8df1-699e3157629d.png" width="200" height="200" align="right" alt="callback-barn logo">

# callback-barn

A very simple app for storing POST requests (request headers, body and timestamp) made to it into DynamoDB, so that you can get them later with a GET request. The use case I made this for is catching and then validating callback requests made from another application during end-to-end testing.

Logo made using [DALL·E 2](https://openai.com/dall-e-2/).

## Usage

### Authentication

If you wish to require an API key for all requests, define `API_KEY` in .env file. This will require a matching `?token={API_KEY}` query parameter to be present in all requests. If `API_KEY` is not defined, the `token` query parameter will be ignored.

### Deployment

Run `npm run deploy` to deploy callback-barn to AWS. Deploying the application will create a DynamoDB table and a single Lambda function with two API Gateway endpoints:

- `POST /{listenerId}?token={API_KEY}` will save the request into DynamoDB. `listenerId` is something that you can just make up, e.g. an uuid string.
- `GET /{listenerId}?token={API_KEY}` will return an array of all invocations for the given `listenerId`, including request body, headers and timestamp.

JSON and plaintext request bodies are supported and have been tested. Other type of request bodies (e.g. form data) will also be stored to DynamoDB but probably not in an ideal format.
