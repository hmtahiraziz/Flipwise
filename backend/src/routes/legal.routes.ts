import { Router } from "express";
import { legalDocuments } from "../content/legal";
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
