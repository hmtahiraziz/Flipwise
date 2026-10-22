import { Router } from "express";
import { legalDocuments } from "../content/legal";
import { renderDeleteAccountHtml } from "../lib/renderDeleteAccountHtml";
import { renderLegalHtml } from "../lib/renderLegalHtml";

export const legalRouter = Router();

legalRouter.get("/privacy", (_req, res) => {
  res
    .type("html")
    .set("Cache-Control", "public, max-age=300")
    .send(renderLegalHtml(legalDocuments.privacy));
});

legalRouter.get("/terms", (_req, res) => {
  res
    .type("html")
    .set("Cache-Control", "public, max-age=300")
    .send(renderLegalHtml(legalDocuments.terms));
});

/** Public account-deletion URL for Google Play Console. */
legalRouter.get("/delete-account", (_req, res) => {
  res
    .type("html")
    .set("Cache-Control", "public, max-age=300")
    .send(renderDeleteAccountHtml());
});
