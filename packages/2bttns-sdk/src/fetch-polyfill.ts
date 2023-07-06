// Set up node-fetch as a global polyfill for fetch, Headers, Request, and Response.
// Without this, server-side API calls won't work because fetch is not defined by default in Node.
import fetch, { Headers, Request, Response } from "node-fetch";

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
  globalThis.Headers = Headers as any;
  globalThis.Request = Request as any;
  globalThis.Response = Response as any;
}
