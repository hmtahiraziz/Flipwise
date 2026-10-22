import * as cheerio from "cheerio";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import sharp from "sharp";
import { getEnv } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { assertPdfMagicBytes } from "../utils/fileMagic";
import {
  assertPublicResolvedHost,
  assertSafeUrlForFetch,
} from "../utils/ssrf";
import { sanitizeImageForOcr } from "./imageSanitize.service";
import { truncateContent } from "./prompts";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_PAGES = 40;
/** Pages to rasterize when a PDF has little/no text layer (scanned docs). */
const MAX_PDF_OCR_PAGES = 3;
const PDF_PARSE_TIMEOUT_MS = 30_000;
const MAX_URL_CHARS = 12000;
const URL_FETCH_TIMEOUT_MS = 15000;
const OCR_TIMEOUT_MS = 90_000;
/** Below this, treat extracted PDF text as unusable and try OCR. */
export const MIN_USEFUL_PDF_TEXT = 40;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(408, message));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function assertPdfBuffer(buffer: Buffer): void {
  if (!buffer?.length) {
    throw new AppError(400, "PDF file is empty");
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new AppError(400, "PDF file exceeds 10 MB limit");
  }
  assertPdfMagicBytes(buffer);
}

export function assertImageBuffer(buffer: Buffer, _mimeType?: string): void {
  if (!buffer?.length) {
    throw new AppError(400, "Image file is empty");
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new AppError(400, "Image exceeds 8 MB limit");
  }
}

export type PdfExtractResult = {
  content: string;
  /** True when text came from page screenshots + vision OCR. */
  usedOcr: boolean;
};

/**
 * Extract a text layer when present. Returns empty string (not throw) when the
 * PDF is image-only / scanned so callers can opt into OCR fallback.
 */
export async function extractPdfTextLayer(buffer: Buffer): Promise<string> {
  assertPdfBuffer(buffer);

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await withTimeout(
      parser.getText({ first: MAX_PDF_PAGES }),
      PDF_PARSE_TIMEOUT_MS,
      "PDF parsing timed out",
    );
    return normalizeWhitespace(result.text ?? "");
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Could not parse PDF file");
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

/** Rasterize the first pages of a scanned PDF and OCR them with vision. */
export async function extractTextFromPdfViaOcr(buffer: Buffer): Promise<string> {
  assertPdfBuffer(buffer);

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const shots = await withTimeout(
      parser.getScreenshot({
        first: MAX_PDF_OCR_PAGES,
        scale: 1.5,
        imageBuffer: true,
        imageDataUrl: false,
      }),
      PDF_PARSE_TIMEOUT_MS * 2,
      "PDF preview timed out",
    );

    const pages = shots.pages ?? [];
    if (pages.length === 0) {
      throw new AppError(
        400,
        "This scanned PDF has no readable pages. Export as images or paste text.",
      );
    }

    const chunks: string[] = [];
    for (const page of pages) {
      let pageBuffer = Buffer.from(page.data);
      if (!pageBuffer.length) continue;
      // Downscale huge page rasters before the OCR image size guard.
      if (pageBuffer.length > MAX_IMAGE_BYTES) {
        try {
          pageBuffer = await sharp(pageBuffer, { failOn: "error" })
            .resize({
              width: 2048,
              height: 2048,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer();
        } catch {
          continue;
        }
      }
      try {
        const mime =
          pageBuffer[0] === 0xff && pageBuffer[1] === 0xd8
            ? "image/jpeg"
            : "image/png";
        const text = await extractTextFromImage(pageBuffer, mime);
        if (text.trim()) {
          chunks.push(text.trim());
        }
      } catch (error) {
        // Keep going across pages; fail only if nothing readable.
        if (error instanceof AppError && error.statusCode >= 500) {
          throw error;
        }
      }
    }

    const merged = normalizeWhitespace(chunks.join("\n\n"));
    if (!merged) {
      throw new AppError(
        400,
        "Could not read text from this scanned PDF. Try clearer pages or paste notes.",
      );
    }
    return truncateContent(merged);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Could not OCR this PDF file");
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

/**
 * Prefer the PDF text layer; optionally fall back to screenshot OCR for
 * image-only / scanned PDFs.
 */
export async function extractTextFromPdf(
  buffer: Buffer,
  options?: { allowOcr?: boolean },
): Promise<PdfExtractResult> {
  const textLayer = await extractPdfTextLayer(buffer);
  if (textLayer.length >= MIN_USEFUL_PDF_TEXT) {
    return { content: truncateContent(textLayer), usedOcr: false };
  }

  if (!options?.allowOcr) {
    throw new AppError(
      400,
      textLayer
        ? "PDF text is too sparse to build cards. Allow AI scan (OCR) or paste more notes."
        : "This looks like a scanned PDF with no text layer. Allow AI scan (OCR) to read it, or paste notes.",
    );
  }

  const ocrText = await extractTextFromPdfViaOcr(buffer);
  return { content: ocrText, usedOcr: true };
}

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  assertImageBuffer(buffer, mimeType);
  const sanitized = await sanitizeImageForOcr(buffer, mimeType);
  const env = getEnv();
  const dataUrl = `data:${sanitized.mimeType};base64,${sanitized.buffer.toString("base64")}`;

  try {
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: OCR_TIMEOUT_MS,
    });

    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0,
      max_tokens: env.OPENAI_MAX_TOKENS_OCR,
      messages: [
        {
          role: "system",
          content:
            "You are an OCR engine for study materials. Extract all readable text from the image. Preserve headings, lists, formulas, and key terms. Return plain text only — no markdown fences or commentary.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract every readable line of study text from this scanned page or notes photo.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const text = normalizeWhitespace(raw);
    if (!text) {
      throw new AppError(400, "Could not read text from this image");
    }
    return truncateContent(text);
  } catch (error) {
    if (error instanceof AppError) throw error;

    const message =
      error instanceof Error ? error.message.toLowerCase() : "";
    if (
      message.includes("invalid_image") ||
      message.includes("unsupported image") ||
      message.includes("could not process image") ||
      message.includes("image_parse")
    ) {
      throw new AppError(
        400,
        "Could not process this photo. Retake as JPEG/PNG with clearer lighting.",
      );
    }
    if (message.includes("timeout") || message.includes("timed out")) {
      throw new AppError(408, "OCR timed out. Try a closer crop of the notes.");
    }

    console.error("OCR failed:", error);
    throw new AppError(
      502,
      "OCR failed. Please try another photo or paste text.",
    );
  }
}

export async function extractTextFromUrl(rawUrl: string): Promise<string> {
  const url = assertSafeUrlForFetch(rawUrl);
  await assertPublicResolvedHost(url.hostname);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  try {
    // redirect: 'manual' prevents following a public host → private IP bounce.
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "manual",
      headers: {
        "User-Agent": "CardweaveBot/1.0 (+https://cardweave.app)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      throw new AppError(400, "URL redirects are not allowed");
    }

    if (!response.ok) {
      throw new AppError(400, `Could not fetch URL (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
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

/** Re-export for routes that accept a text-layer hit without OCR. */
export function truncateImportedText(content: string): string {
  return truncateContent(content);
}
