import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { mergePdfDocuments } from "@/lib/pdf-merge";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    doc.addPage();
  }
  const bytes = await doc.save();
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
}

describe("mergePdfDocuments", () => {
  it("appends attachment pages after the primary document", async () => {
    const primary = await makePdf(1);
    const attachment = await makePdf(2);

    const mergedBytes = await mergePdfDocuments(primary, [attachment]);
    const merged = await PDFDocument.load(mergedBytes);

    expect(merged.getPageCount()).toBe(3);
  });
});
