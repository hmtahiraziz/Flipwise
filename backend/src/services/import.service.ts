import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { AppError } from "../middleware/errorHandler";
import { truncateContent } from "./prompts";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_URL_CHARS = 12000;
const URL_FETCH_TIMEOUT_MS = 15000;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function assertPdfBuffer(buffer: Buffer): void {
  if (!buffer?.length) {
    throw new AppError(400, "PDF file is empty");
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new AppError(400, "PDF file exceeds 10 MB limit");
  }
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  assertPdfBuffer(buffer);

  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    const text = normalizeWhitespace(result.text ?? "");
    if (!text) {
      throw new AppError(400, "Could not extract text from PDF");
    }
    return truncateContent(text);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Could not parse PDF file");
  }
}

function assertValidUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new AppError(400, "Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError(400, "Only http and https URLs are supported");
  }

  return parsed;
}

export async function extractTextFromUrl(rawUrl: string): Promise<string> {
  const url = assertValidUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "FlipwiseBot/1.0 (+https://flipwise.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new AppError(400, `Could not fetch URL (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new AppError(400, "URL must point to a readable HTML or text page");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, aside, noscript").remove();

    const text = normalizeWhitespace(
      $("article").text() || $("main").text() || $("body").text(),
    );

    if (!text) {
      throw new AppError(400, "No readable text found at URL");
    }

    return truncateContent(text.slice(0, MAX_URL_CHARS));
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(408, "URL fetch timed out");
    }
    throw new AppError(400, "Could not extract text from URL");
  } finally {
    clearTimeout(timeout);
  }
}

export type ImportSourceResult = {
  content: string;
  sourceType: "notes";
};

export function buildImportResult(content: string): ImportSourceResult {
  return { content, sourceType: "notes" };
}
