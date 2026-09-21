import { PDFDocument } from "pdf-lib";

/**
 * Merge PDF documents client-side. Primary document pages come first,
 * then each attachment's pages in order.
 */
export async function mergePdfDocuments(
  primaryPdf: ArrayBuffer,
  attachmentPdfs: ArrayBuffer[],
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  const primary = await PDFDocument.load(primaryPdf);
  const primaryPages = await merged.copyPages(primary, primary.getPageIndices());
  for (const page of primaryPages) {
    merged.addPage(page);
  }

  for (const attachment of attachmentPdfs) {
    const doc = await PDFDocument.load(attachment);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }

  return merged.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
