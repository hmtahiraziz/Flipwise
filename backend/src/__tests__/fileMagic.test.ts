import { describe, expect, it } from "vitest";
import { AppError } from "../middleware/errorHandler";
import {
  assertPdfMagicBytes,
  detectImageMagicBytes,
} from "../utils/fileMagic";

describe("fileMagic", () => {
  it("accepts PDF magic bytes", () => {
    expect(() =>
      assertPdfMagicBytes(Buffer.from("%PDF-1.4\nfake")),
    ).not.toThrow();
  });

  it("rejects non-PDF buffers", () => {
    expect(() => assertPdfMagicBytes(Buffer.from("not-a-pdf"))).toThrow(
      AppError,
    );
  });

  it("detects common image formats", () => {
    expect(detectImageMagicBytes(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "jpeg",
    );
    expect(
      detectImageMagicBytes(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("png");
    expect(
      detectImageMagicBytes(Buffer.from("GIF89a............", "ascii")),
    ).toBe("gif");

    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0, "ascii");
    webp.write("WEBP", 8, "ascii");
    expect(detectImageMagicBytes(webp)).toBe("webp");
  });

  it("rejects unknown image bytes", () => {
    expect(() => detectImageMagicBytes(Buffer.from("hello"))).toThrow(AppError);
  });
});
