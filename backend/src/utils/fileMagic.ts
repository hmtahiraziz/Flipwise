import { AppError } from "../middleware/errorHandler";

export type DetectedImageKind = "jpeg" | "png" | "webp" | "gif";

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

/** Reject non-PDF polyglots / renamed files. */
export function assertPdfMagicBytes(buffer: Buffer): void {
  // %PDF
  if (!startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) {
    throw new AppError(400, "File is not a valid PDF");
  }
}

export function detectImageMagicBytes(buffer: Buffer): DetectedImageKind {
  // JPEG
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return "jpeg";
  }
  // PNG
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "png";
  }
  // GIF87a / GIF89a
  if (
    startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "gif";
  }
  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  throw new AppError(
    400,
    "Image file type could not be verified (use JPEG, PNG, WEBP, or GIF)",
  );
}

export function mimeForImageKind(kind: DetectedImageKind): string {
  switch (kind) {
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
  }
}
