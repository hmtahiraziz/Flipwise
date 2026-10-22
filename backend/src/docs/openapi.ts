import { timingSafeEqual } from "node:crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { getEnv } from "../config/env";
import { registerOpenApiPaths } from "./registerPaths";
import { registry } from "./registry";

let cachedDocument: ReturnType<OpenApiGeneratorV3["generateDocument"]> | null =
  null;

export function buildOpenApiDocument() {
  if (cachedDocument) return cachedDocument;

  registerOpenApiPaths();

  const generator = new OpenApiGeneratorV3(registry.definitions);
  cachedDocument = generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "AI Flashcard API",
      version: "1.0.0",
      description: [
        "Backend API for Cardweave / AI Flashcard.",
        "",
        "**Docs login:** `/api-docs` and `/openapi.json` are protected with HTTP Basic Auth",
        "(`API_DOCS_USER` / `API_DOCS_PASSWORD`). The browser will prompt once.",
        "",
        "**API authentication:** Most `/api/*` routes require a Clerk session JWT.",
        "After opening Swagger UI, use the **Authorize** button and paste a Bearer token",
        "from a signed-in Clerk session.",
        "Legacy `/api/auth/login|register|refresh|logout` endpoints return `410` — auth is handled by Clerk on the client.",
        "",
        "**Docs exposure:** Mounted only when `NODE_ENV !== \"production\"`, or when `ENABLE_API_DOCS=true`.",
      ].join("\n"),
    },
    servers: [
      {
        url: "http://localhost:{port}",
        description: "Local development",
        variables: {
          port: {
            default: "3000",
          },
        },
      },
    ],
    tags: [
      { name: "System", description: "Liveness" },
      { name: "Auth", description: "Current user and account lifecycle" },
      { name: "Decks", description: "Study decks" },
      { name: "Cards", description: "Flashcards and generation/import" },
      { name: "AI", description: "Quota-gated AI features" },
      { name: "Import", description: "PDF / image / URL import" },
      { name: "Reviews", description: "Spaced-repetition queue and ratings" },
      { name: "Progress", description: "Study stats" },
      { name: "Reports", description: "Content reports" },
      { name: "Webhooks", description: "Clerk / Svix callbacks" },
    ],
    security: [{ bearerAuth: [] }],
  });

  return cachedDocument;
}

function clearDocsCsp(_req: Request, res: Response, next: NextFunction): void {
  // Swagger UI needs inline styles/scripts that Helmet CSP would block.
  res.removeHeader("Content-Security-Policy");
  next();
}

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * HTTP Basic Auth gate for Swagger UI / OpenAPI JSON.
 * Credentials come from `API_DOCS_USER` and `API_DOCS_PASSWORD`.
 */
function getDocsCredentials(): { user: string; password: string } {
  const env = getEnv();
  return {
    user: env.API_DOCS_USER || "docs",
    password: env.API_DOCS_PASSWORD || "docs",
  };
}

export function docsBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { user: expectedUser, password: expectedPassword } =
    getDocsCredentials();
  const header = req.headers.authorization;

  if (!header?.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Docs"');
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Docs"');
    res.status(401).json({ error: "Invalid authorization header" });
    return;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Docs"');
    res.status(401).json({ error: "Invalid authorization header" });
    return;
  }

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  if (
    !safeEqualString(user, expectedUser) ||
    !safeEqualString(password, expectedPassword)
  ) {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Docs"');
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  next();
}

/**
 * Serves interactive docs at `/api-docs` and the raw spec at `/openapi.json`.
 * Call only when docs should be publicly reachable (typically non-production).
 * Both routes require HTTP Basic Auth (`API_DOCS_USER` / `API_DOCS_PASSWORD`).
 */
export function mountOpenApiDocs(app: Express): void {
  const isProduction = process.env.NODE_ENV === "production";
  const { user, password } = getDocsCredentials();

  if (isProduction && (user === "docs" || password === "docs")) {
    throw new Error(
      "Refusing to expose API docs in production with default API_DOCS_USER/API_DOCS_PASSWORD. Set strong credentials.",
    );
  }

  const spec = buildOpenApiDocument();

  app.get("/openapi.json", docsBasicAuth, (_req, res) => {
    res.json(spec);
  });

  app.use(
    "/api-docs",
    docsBasicAuth,
    clearDocsCsp,
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: "AI Flashcard API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );
}

export function shouldEnableApiDocs(): boolean {
  if (process.env.ENABLE_API_DOCS === "true") return true;
  if (process.env.ENABLE_API_DOCS === "false") return false;
  return process.env.NODE_ENV !== "production";
}
