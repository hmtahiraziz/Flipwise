import sharp from "sharp";
import { AppError } from "../middleware/errorHandler";
import { detectImageMagicBytes } from "../utils/fileMagic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 4096;

export type SanitizedImage = {
  buffer: Buffer;
  mimeType: "image/jpeg";
  detectedKind: ReturnType<typeof detectImageMagicBytes>;
};

/**
 * Verify magic bytes, re-encode with sharp (strips EXIF/metadata),
 * and return a normalized JPEG for OCR.
 */
export async function sanitizeImageForOcr(
  buffer: Buffer,
  _claimedMime?: string,
): Promise<SanitizedImage> {
  if (!buffer?.length) {
    throw new AppError(400, "Image file is empty");
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new AppError(400, "Image exceeds 8 MB limit");
  }

  const detectedKind = detectImageMagicBytes(buffer);

  try {
    const out = await sharp(buffer, {
      failOn: "error",
      animated: false,
      limitInputPixels: MAX_DIMENSION * MAX_DIMENSION,
    })
      .rotate() // honor orientation then strip EXIF via re-encode
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    if (!out.length) {
      throw new AppError(400, "Could not process image");
    }
    if (out.length > MAX_IMAGE_BYTES) {
      throw new AppError(400, "Processed image exceeds size limit");
    }

    return {
      buffer: out,
      mimeType: "image/jpeg",
      detectedKind,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(400, "Could not process image file");
  }
}
