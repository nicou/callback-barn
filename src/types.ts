export interface SavedInvocation {
  listenerId: string;
  createdAt: string; // ISO 8601 formatted date
  headers: Record<string, string>;
  method: string;
  body: unknown;
}

export interface NewInvocationResponse {
  id: string;
  status: "OK";
}
