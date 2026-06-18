type AssessmentReportOptions = {
  notesHtml: string;
  reportTitle?: string;
  tenantLogoUrl: string;
};

type TextStyle = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

type TextRun = TextStyle & {
  text: string;
};

type ReportBlock = {
  runs: TextRun[];
  listPrefix?: string;
};

type PdfLogo = {
  data: string;
  width: number;
  height: number;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 54;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 58;
const FONT_SIZE = 11;
const LINE_HEIGHT = 17;
const TITLE_FONT_SIZE = 18;
const TITLE_LINE_HEIGHT = 28;
const LOGO_MAX_WIDTH = 180;
const LOGO_MAX_HEIGHT = 64;
const BULLET_MARKER = "\x95";

function sanitizeRichTextHtml(html: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = html;

  for (const element of template.content.querySelectorAll("*")) {
    if (
      ["script", "style", "link", "meta"].includes(
        element.tagName.toLowerCase(),
      )
    ) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  return template.content;
}

function isBlockElement(element: HTMLElement): boolean {
  return [
    "address",
    "article",
    "aside",
    "blockquote",
    "div",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "li",
    "main",
    "p",
    "section",
  ].includes(element.tagName.toLowerCase());
}

function nextStyleFromElement(
  element: HTMLElement,
  inheritedStyle: TextStyle,
): TextStyle {
  const tagName = element.tagName.toLowerCase();
  const fontWeight = element.style.fontWeight;
  const numericFontWeight = Number(fontWeight);
  const isBoldStyle =
    fontWeight === "bold" ||
    fontWeight === "bolder" ||
    (!Number.isNaN(numericFontWeight) && numericFontWeight >= 600);
  const textDecoration = [
    element.style.textDecoration,
    element.style.textDecorationLine,
  ].join(" ");

  return {
    bold:
      inheritedStyle.bold ||
      tagName === "b" ||
      tagName === "strong" ||
      isBoldStyle,
    italic:
      inheritedStyle.italic ||
      tagName === "i" ||
      tagName === "em" ||
      element.style.fontStyle === "italic" ||
      element.style.fontStyle === "oblique",
    underline:
      inheritedStyle.underline ||
      tagName === "u" ||
      textDecoration.includes("underline"),
  };
}

function collectInlineRuns(node: Node, inheritedStyle: TextStyle): TextRun[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\s+/g, " ") ?? "";
    return text ? [{ ...inheritedStyle, text }] : [];
  }

  if (!(node instanceof HTMLElement)) {
    return Array.from(node.childNodes).flatMap((child) =>
      collectInlineRuns(child, inheritedStyle),
    );
  }

  const tagName = node.tagName.toLowerCase();
  if (tagName === "br") {
    return [{ ...inheritedStyle, text: "\n" }];
  }

  const nextStyle = nextStyleFromElement(node, inheritedStyle);
  return Array.from(node.childNodes).flatMap((child) =>
    collectInlineRuns(child, nextStyle),
  );
}

function splitRunsAtLineBreaks(runs: TextRun[]): TextRun[][] {
  const lines: TextRun[][] = [[]];

  for (const run of runs) {
    const parts = run.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) {
        lines.push([]);
      }
      if (part) {
        lines[lines.length - 1]?.push({ ...run, text: part });
      }
    });
  }

  return lines.filter((line) => line.some((run) => run.text.trim()));
}

function parseBlocks(html: string): ReportBlock[] {
  const fragment = sanitizeRichTextHtml(html);
  const blocks: ReportBlock[] = [];
  const emptyStyle = { bold: false, italic: false, underline: false };

  function pushRuns(runs: TextRun[], listPrefix?: string) {
    for (const line of splitRunsAtLineBreaks(runs)) {
      const cleanedRuns = line.filter((run) => run.text.trim());
      if (cleanedRuns.length > 0) {
        blocks.push({ runs: cleanedRuns, listPrefix });
      }
    }
  }

  function pushBlock(node: Node, listPrefix?: string) {
    pushRuns(collectInlineRuns(node, emptyStyle), listPrefix);
  }

  function walkChildren(node: Node) {
    node.childNodes.forEach(walk);
  }

  function walk(node: Node) {
    if (node instanceof HTMLUListElement || node instanceof HTMLOListElement) {
      Array.from(node.children).forEach((child, index) => {
        if (child instanceof HTMLLIElement) {
          walkListItem(
            child,
            node instanceof HTMLOListElement ? `${index + 1}.` : BULLET_MARKER,
          );
        }
      });
      return;
    }

    if (node instanceof HTMLLIElement) {
      walkListItem(node, BULLET_MARKER);
      return;
    }

    if (node instanceof HTMLElement) {
      const hasListChildren = Boolean(node.querySelector("ul, ol"));
      if (isBlockElement(node) && !hasListChildren) {
        pushBlock(node);
        return;
      }
    }

    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      pushBlock(node);
      return;
    }

    walkChildren(node);
  }

  function walkListItem(item: HTMLLIElement, listPrefix: string) {
    const inlineContainer = document.createElement("span");

    for (const child of Array.from(item.childNodes)) {
      if (
        child instanceof HTMLUListElement ||
        child instanceof HTMLOListElement
      ) {
        continue;
      }
      inlineContainer.append(child.cloneNode(true));
    }

    pushBlock(inlineContainer, listPrefix);

    for (const child of Array.from(item.children)) {
      if (
        child instanceof HTMLUListElement ||
        child instanceof HTMLOListElement
      ) {
        walk(child);
      }
    }
  }

  fragment.childNodes.forEach(walk);
  return blocks;
}

function normalizePdfText(value: string): string {
  return value
    .replaceAll("\r", "")
    .replaceAll("\n", " ")
    .replaceAll("\u2019", "'")
    .replaceAll("\u2018", "'")
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2026", "...")
    .replace(/[^\x09\x0a\x0d\x20-\x7e\x80-\xff]/g, "");
}

function pdfString(value: string): string {
  return `(${normalizePdfText(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")})`;
}

function fontName(run: TextStyle): string {
  if (run.bold && run.italic) return "F4";
  if (run.bold) return "F2";
  if (run.italic) return "F3";
  return "F1";
}

function approximateTextWidth(text: string, fontSize: number): number {
  return normalizePdfText(text).length * fontSize * 0.52;
}

function splitRunsIntoLines(runs: TextRun[], maxWidth: number): TextRun[][] {
  const lines: TextRun[][] = [];
  let currentLine: TextRun[] = [];
  let currentWidth = 0;

  for (const run of runs) {
    const words = run.text.split(/(\s+)/).filter(Boolean);
    for (const word of words) {
      const width = approximateTextWidth(word, FONT_SIZE);
      if (currentLine.length > 0 && currentWidth + width > maxWidth) {
        lines.push(currentLine);
        currentLine = [];
        currentWidth = 0;
      }
      currentLine.push({ ...run, text: word });
      currentWidth += width;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function drawTextLine(runs: TextRun[], x: number, y: number): string {
  let cursorX = x;
  const underlineSegments: Array<{ x: number; width: number }> = [];
  const segments = runs
    .filter((run) => run.text)
    .map((run) => {
      const width = approximateTextWidth(run.text, FONT_SIZE);
      if (run.underline) {
        underlineSegments.push({ x: cursorX, width });
      }
      cursorX += width;
      return `/${fontName(run)} ${FONT_SIZE} Tf ${pdfString(run.text)} Tj`;
    })
    .join(" ");

  const underlines = underlineSegments
    .map(
      (segment) =>
        `${segment.x.toFixed(2)} ${(y - 2).toFixed(2)} m ${(segment.x + segment.width).toFixed(2)} ${(y - 2).toFixed(2)} l`,
    )
    .join(" ");
  const underlineDrawing = underlines ? `q 0.55 w ${underlines} S Q\n` : "";

  return `BT ${x.toFixed(2)} ${y.toFixed(2)} Td ${segments} ET\n${underlineDrawing}`;
}

async function loadLogo(tenantLogoUrl: string): Promise<PdfLogo | null> {
  if (!tenantLogoUrl) return null;

  try {
    const response = await fetch(tenantLogoUrl, { cache: "no-store" });
    if (!response.ok) return null;

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return null;
    }

    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return {
      data: atob(dataUrl.split(",")[1] ?? ""),
      width: canvas.width,
      height: canvas.height,
    };
  } catch {
    return null;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function safeFilename(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-|-$/g, "");
  return `${cleaned || "assessment-report"}.pdf`;
}

function buildPdfPages({
  blocks,
  logo,
  reportTitle,
}: {
  blocks: ReportBlock[];
  logo: PdfLogo | null;
  reportTitle?: string;
}): string[] {
  const pages: string[] = [];
  let currentContent = "";
  let y = PAGE_HEIGHT - MARGIN_TOP;

  function startPage() {
    currentContent = "";
    y = PAGE_HEIGHT - MARGIN_TOP;
  }

  function finishPage() {
    pages.push(currentContent);
    startPage();
  }

  function ensureSpace(requiredHeight: number) {
    if (y - requiredHeight < MARGIN_BOTTOM) {
      finishPage();
    }
  }

  startPage();

  if (logo) {
    const scale = Math.min(
      LOGO_MAX_WIDTH / logo.width,
      LOGO_MAX_HEIGHT / logo.height,
      1,
    );
    const width = logo.width * scale;
    const height = logo.height * scale;
    const x = (PAGE_WIDTH - width) / 2;
    ensureSpace(height + 24);
    currentContent += `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${(y - height).toFixed(2)} cm /Im1 Do Q\n`;
    y -= height + 24;
  }

  const trimmedTitle = (reportTitle ?? "").trim();
  if (trimmedTitle) {
    ensureSpace(TITLE_LINE_HEIGHT);
    currentContent += `BT /F2 ${TITLE_FONT_SIZE} Tf ${MARGIN_X} ${y.toFixed(2)} Td ${pdfString(trimmedTitle)} Tj ET\n`;
    y -= TITLE_LINE_HEIGHT;
  }

  for (const block of blocks) {
    const prefixWidth = block.listPrefix ? 24 : 0;
    const lines = splitRunsIntoLines(
      block.runs,
      PAGE_WIDTH - MARGIN_X * 2 - prefixWidth,
    );

    ensureSpace(lines.length * LINE_HEIGHT + 6);
    lines.forEach((line, index) => {
      if (block.listPrefix && index === 0) {
        currentContent += drawTextLine(
          [
            {
              text: block.listPrefix,
              bold: false,
              italic: false,
              underline: false,
            },
          ],
          MARGIN_X,
          y,
        );
      }
      currentContent += drawTextLine(line, MARGIN_X + prefixWidth, y);
      y -= LINE_HEIGHT;
    });
    y -= 4;
  }

  finishPage();
  return pages;
}

function pdfObject(value: string): string {
  return `${value}\n`;
}

function createPdfBlob(pages: string[], logo: PdfLogo | null): Blob {
  const objects: string[] = [];
  const catalogObject = 1;
  const pagesObject = 2;
  const fontRegularObject = 3;
  const fontBoldObject = 4;
  const fontItalicObject = 5;
  const fontBoldItalicObject = 6;
  const logoObject = logo ? 7 : null;
  const firstPageObject = logo ? 8 : 7;

  objects[catalogObject] = pdfObject("<< /Type /Catalog /Pages 2 0 R >>");
  objects[fontRegularObject] = pdfObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  objects[fontBoldObject] = pdfObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );
  objects[fontItalicObject] = pdfObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>",
  );
  objects[fontBoldItalicObject] = pdfObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>",
  );

  if (logo && logoObject) {
    objects[logoObject] =
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.data.length} >>\nstream\n${logo.data}\nendstream\n`;
  }

  const pageRefs: string[] = [];
  pages.forEach((pageContent, index) => {
    const pageObject = firstPageObject + index * 2;
    const contentObject = pageObject + 1;
    const pageNumber = `Page ${index + 1} of ${pages.length}`;
    const pageNumberX = PAGE_WIDTH / 2 - pageNumber.length * 2.2;
    const content = `${pageContent}BT /F1 9 Tf ${pageNumberX.toFixed(2)} 28 Td ${pdfString(pageNumber)} Tj ET\n`;
    const xObjects = logo ? " /XObject << /Im1 7 0 R >>" : "";

    objects[pageObject] = pdfObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >>${xObjects} >> /Contents ${contentObject} 0 R >>`,
    );
    objects[contentObject] =
      `<< /Length ${content.length} >>\nstream\n${content}endstream\n`;
    pageRefs.push(`${pageObject} 0 R`);
  });

  objects[pagesObject] = pdfObject(
    `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`,
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}endobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = Uint8Array.from(pdf, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: "application/pdf" });
}

export async function downloadAssessmentReport({
  notesHtml,
  reportTitle,
  tenantLogoUrl,
}: AssessmentReportOptions): Promise<void> {
  const trimmedTitle = (reportTitle ?? "").trim();
  const [logo] = await Promise.all([loadLogo(tenantLogoUrl)]);
  const blocks = parseBlocks(notesHtml);
  const pages = buildPdfPages({ blocks, logo, reportTitle: trimmedTitle });
  const blob = createPdfBlob(pages, logo);
  downloadBlob(blob, safeFilename(trimmedTitle));
}
