import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Clerk session JWT from the mobile app. Paste the raw token only — Swagger UI adds the `Bearer ` prefix. Obtain a token via Clerk (signed-in session), then use Authorize.",
});

registry.registerComponent("securitySchemes", "svixWebhook", {
  type: "apiKey",
  in: "header",
  name: "svix-signature",
  description:
    "Clerk webhooks are verified with Svix. Required headers: `svix-id`, `svix-timestamp`, and `svix-signature` (plus raw JSON body).",
});
