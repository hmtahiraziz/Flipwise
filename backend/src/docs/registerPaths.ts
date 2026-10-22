import { registry, z } from "./registry";
import {
  BulkCardsBodySchema,
  CardBodySchema,
  CardIdParam,
  CreateDeckBodySchema,
  DeckIdParam,
  DeckSchema,
  ErrorSchema,
  ExplainBodySchema,
  ExplainResultSchema,
  FlashcardSchema,
  GenerateCardsBodySchema,
  GeneratedCardSchema,
  HealthSchema,
  ImportResultSchema,
  OkSchema,
  ProgressHistorySchema,
  ProgressSummarySchema,
  RateCardBodySchema,
  ReportBodySchema,
  ReportSchema,
  ReviewQueueItemSchema,
  UpdateDeckBodySchema,
  UrlImportBodySchema,
  UserSchema,
  UuidParam,
  ValidationErrorSchema,
  bearerSecurity,
  jsonContent,
  noSecurity,
} from "./schemas";

const unauthorized = {
  description: "Missing or invalid Clerk Bearer token",
  content: jsonContent(ErrorSchema),
};

const validationFailed = {
  description: "Request validation failed",
  content: jsonContent(ValidationErrorSchema),
};

const notFound = {
  description: "Resource not found",
  content: jsonContent(ErrorSchema),
};

export function registerOpenApiPaths(): void {
  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["System"],
    summary: "Health check",
    security: [...noSecurity],
    responses: {
      200: {
        description: "API is up",
        content: jsonContent(HealthSchema),
      },
    },
  });

  // —— Auth ——
  registry.registerPath({
    method: "get",
    path: "/api/auth/me",
    tags: ["Auth"],
    summary: "Current user",
    description: "Returns the app user linked to the Clerk session JWT.",
    security: [...bearerSecurity],
    responses: {
      200: {
        description: "Authenticated user",
        content: jsonContent(z.object({ user: UserSchema })),
      },
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/auth/account",
    tags: ["Auth"],
    summary: "Delete account",
    description:
      "Permanently deletes the caller's Neon study data and Clerk user. Client should clear local storage and sign out after success.",
    security: [...bearerSecurity],
    responses: {
      200: {
        description: "Account deleted",
        content: jsonContent(OkSchema),
      },
      401: unauthorized,
    },
  });

  // —— Decks ——
  registry.registerPath({
    method: "get",
    path: "/api/decks",
    tags: ["Decks"],
    summary: "List decks",
    security: [...bearerSecurity],
    responses: {
      200: {
        description: "Deck list",
        content: jsonContent(z.object({ decks: z.array(DeckSchema) })),
      },
      401: unauthorized,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks",
    tags: ["Decks"],
    summary: "Create deck",
    security: [...bearerSecurity],
    request: {
      body: {
        required: true,
        content: jsonContent(CreateDeckBodySchema),
      },
    },
    responses: {
      201: {
        description: "Deck created",
        content: jsonContent(z.object({ deck: DeckSchema })),
      },
      400: validationFailed,
      401: unauthorized,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/decks/{id}",
    tags: ["Decks"],
    summary: "Get deck",
    security: [...bearerSecurity],
    request: {
      params: z.object({ id: UuidParam }),
    },
    responses: {
      200: {
        description: "Deck",
        content: jsonContent(z.object({ deck: DeckSchema })),
      },
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/decks/{id}",
    tags: ["Decks"],
    summary: "Update deck",
    security: [...bearerSecurity],
    request: {
      params: z.object({ id: UuidParam }),
      body: {
        required: true,
        content: jsonContent(UpdateDeckBodySchema),
      },
    },
    responses: {
      200: {
        description: "Updated deck",
        content: jsonContent(z.object({ deck: DeckSchema })),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/decks/{id}",
    tags: ["Decks"],
    summary: "Delete deck",
    security: [...bearerSecurity],
    request: {
      params: z.object({ id: UuidParam }),
    },
    responses: {
      200: {
        description: "Deck deleted",
        content: jsonContent(OkSchema),
      },
      401: unauthorized,
      404: notFound,
    },
  });

  // —— Cards (nested under deck) ——
  registry.registerPath({
    method: "get",
    path: "/api/decks/{deckId}/cards",
    tags: ["Cards"],
    summary: "List cards in deck",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
    },
    responses: {
      200: {
        description: "Cards",
        content: jsonContent(z.object({ cards: z.array(FlashcardSchema) })),
      },
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards",
    tags: ["Cards"],
    summary: "Create card",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: jsonContent(CardBodySchema),
      },
    },
    responses: {
      201: {
        description: "Card created",
        content: jsonContent(z.object({ card: FlashcardSchema })),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards/bulk",
    tags: ["Cards"],
    summary: "Bulk create cards",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: jsonContent(BulkCardsBodySchema),
      },
    },
    responses: {
      201: {
        description: "Cards created",
        content: jsonContent(z.object({ cards: z.array(FlashcardSchema) })),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards/generate",
    tags: ["Cards", "AI"],
    summary: "Generate flashcards with AI",
    description: "Requires AI consent and counts against the daily generate quota.",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: jsonContent(GenerateCardsBodySchema),
      },
    },
    responses: {
      200: {
        description: "Generated cards (not yet persisted — client may save via bulk)",
        content: jsonContent(z.object({ cards: z.array(GeneratedCardSchema) })),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
      429: {
        description: "Rate limit or AI quota exceeded",
        content: jsonContent(ErrorSchema),
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards/import/pdf",
    tags: ["Cards", "Import"],
    summary: "Import text from PDF",
    description:
      "Extracts the PDF text layer when present. Scanned/image-only PDFs require `aiConsent` and use OCR on the first pages (counts against OCR quota).",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z.object({
              file: z.string().openapi({
                type: "string",
                format: "binary",
                description: "PDF file (max 10 MB)",
              }),
              aiConsent: z
                .union([z.literal("true"), z.literal("1"), z.literal(true)])
                .optional()
                .openapi({
                  description:
                    "Required when the PDF has no usable text layer (scanned docs).",
                }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Extracted notes content",
        content: jsonContent(ImportResultSchema),
      },
      400: {
        description: "Invalid or missing PDF / missing consent for OCR",
        content: jsonContent(ErrorSchema),
      },
      401: unauthorized,
      404: notFound,
      429: {
        description: "Rate limit or AI OCR quota exceeded",
        content: jsonContent(ErrorSchema),
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards/import/image",
    tags: ["Cards", "Import", "AI"],
    summary: "OCR import from image",
    description: "Requires `aiConsent` form field and counts against OCR quota.",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z.object({
              file: z.string().openapi({
                type: "string",
                format: "binary",
                description: "JPEG, PNG, WEBP, or GIF (max 8 MB)",
              }),
              aiConsent: z.union([
                z.literal("true"),
                z.literal("1"),
                z.literal(true),
              ]),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "OCR notes content",
        content: jsonContent(ImportResultSchema),
      },
      400: {
        description: "Invalid image or missing consent",
        content: jsonContent(ErrorSchema),
      },
      401: unauthorized,
      404: notFound,
      429: {
        description: "Rate limit or AI quota exceeded",
        content: jsonContent(ErrorSchema),
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/decks/{deckId}/cards/import/url",
    tags: ["Cards", "Import"],
    summary: "Import text from URL",
    security: [...bearerSecurity],
    request: {
      params: z.object({ deckId: DeckIdParam }),
      body: {
        required: true,
        content: jsonContent(UrlImportBodySchema),
      },
    },
    responses: {
      200: {
        description: "Fetched notes content",
        content: jsonContent(ImportResultSchema),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/api/cards/{id}",
    tags: ["Cards"],
    summary: "Update card",
    security: [...bearerSecurity],
    request: {
      params: z.object({ id: UuidParam }),
      body: {
        required: true,
        content: jsonContent(CardBodySchema.partial()),
      },
    },
    responses: {
      200: {
        description: "Updated card",
        content: jsonContent(z.object({ card: FlashcardSchema })),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/cards/{id}",
    tags: ["Cards"],
    summary: "Delete card",
    security: [...bearerSecurity],
    request: {
      params: z.object({ id: UuidParam }),
    },
    responses: {
      200: {
        description: "Card deleted",
        content: jsonContent(OkSchema),
      },
      401: unauthorized,
      404: notFound,
    },
  });

  // —— Reviews ——
  registry.registerPath({
    method: "get",
    path: "/api/reviews/queue",
    tags: ["Reviews"],
    summary: "Due review queue",
    security: [...bearerSecurity],
    request: {
      query: z.object({
        deckId: z.string().uuid().optional(),
        timeZone: z.string().trim().min(1).max(64).optional(),
      }),
    },
    responses: {
      200: {
        description: "Queue items",
        content: jsonContent(
          z.object({ queue: z.array(ReviewQueueItemSchema) }),
        ),
      },
      400: validationFailed,
      401: unauthorized,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/reviews/{cardId}/rate",
    tags: ["Reviews"],
    summary: "Rate a card (SRS)",
    security: [...bearerSecurity],
    request: {
      params: z.object({ cardId: CardIdParam }),
      body: {
        required: true,
        content: jsonContent(RateCardBodySchema),
      },
    },
    responses: {
      200: {
        description: "Updated card + review state",
        content: jsonContent(
          z.object({
            card: FlashcardSchema,
            review: z.record(z.string(), z.unknown()),
          }),
        ),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/reviews/{cardId}/explain",
    tags: ["Reviews", "AI"],
    summary: "AI explanation for a card",
    security: [...bearerSecurity],
    request: {
      params: z.object({ cardId: CardIdParam }),
      body: {
        required: true,
        content: jsonContent(ExplainBodySchema),
      },
    },
    responses: {
      200: {
        description: "Explanation payload",
        content: jsonContent(ExplainResultSchema),
      },
      400: validationFailed,
      401: unauthorized,
      404: notFound,
      429: {
        description: "Rate limit or AI quota exceeded",
        content: jsonContent(ErrorSchema),
      },
    },
  });

  // —— Progress ——
  registry.registerPath({
    method: "get",
    path: "/api/progress/summary",
    tags: ["Progress"],
    summary: "Progress summary",
    security: [...bearerSecurity],
    request: {
      query: z.object({
        timeZone: z.string().trim().min(1).max(64).optional(),
      }),
    },
    responses: {
      200: {
        description: "Summary",
        content: jsonContent(z.object({ summary: ProgressSummarySchema })),
      },
      401: unauthorized,
    },
  });

  registry.registerPath({
    method: "get",
    path: "/api/progress/history",
    tags: ["Progress"],
    summary: "Progress history",
    security: [...bearerSecurity],
    request: {
      query: z.object({
        days: z.coerce.number().int().min(1).max(90).optional().default(30),
        timeZone: z.string().trim().min(1).max(64).optional(),
      }),
    },
    responses: {
      200: {
        description: "Daily history",
        content: jsonContent(ProgressHistorySchema),
      },
      400: validationFailed,
      401: unauthorized,
    },
  });

  // —— Reports ——
  registry.registerPath({
    method: "post",
    path: "/api/reports",
    tags: ["Reports"],
    summary: "Report content",
    security: [...bearerSecurity],
    request: {
      body: {
        required: true,
        content: jsonContent(ReportBodySchema),
      },
    },
    responses: {
      201: {
        description: "Report created",
        content: jsonContent(z.object({ report: ReportSchema })),
      },
      400: validationFailed,
      401: unauthorized,
    },
  });

  // —— Webhooks ——
  registry.registerPath({
    method: "post",
    path: "/webhooks/clerk",
    tags: ["Webhooks"],
    summary: "Clerk Svix webhook",
    description:
      "Receives Clerk user events. Not for browser Try-it-out — requires Svix signature headers and raw body.",
    security: [{ svixWebhook: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              type: z.string(),
              data: z.object({ id: z.string().optional() }).passthrough(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Webhook accepted",
        content: jsonContent(OkSchema),
      },
      400: {
        description: "Invalid signature or payload",
        content: jsonContent(ErrorSchema),
      },
      503: {
        description: "CLERK_WEBHOOK_SECRET not configured",
        content: jsonContent(ErrorSchema),
      },
    },
  });
}
