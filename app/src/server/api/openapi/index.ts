import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "../root";
import { OPENAPI_TAGS } from "./openApiTags";

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "2bttns API",
  description: "OpenAPI compliant REST API built using tRPC with Next.js",
  version: "1.0.0",
  baseUrl: "http://localhost:3000/api",
  tags: Object.values(OPENAPI_TAGS),
});
