import type { jsPDF } from "jspdf";
import type { Styles, UserOptions } from "jspdf-autotable";

import {
  lightenRgb,
  type PdfBrandPalette,
  type PdfLogo,
  type RgbColor,
} from "@/lib/pdf-branding";

export const PDF_PAGE_MARGIN = 18;

export type PdfStatusBadgeColors = {
  fill: RgbColor;
  text: RgbColor;
};

export type PdfMetaField = {
  label: string;
  value: string;
};

export type PdfPartyColumn = {
  title: string;
  primary?: string;
  lines?: string[];
};

export type PdfTotalRow = {
  label: string;
  value: string;
  emphasized?: boolean;
};

type DocWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

export function getPdfPageMetrics(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_PAGE_MARGIN;
  return {
    pageWidth,
    pageHeight,
    margin,
    contentWidth: pageWidth - margin * 2,
  };
}

/** Thin primary accent strip at the top of the page (modern SaaS style). */
export function drawAccentBar(doc: jsPDF, colors: PdfBrandPalette) {
  const { pageWidth } = getPdfPageMetrics(doc);
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 2, "F");
}

export function drawStatusBadge(
  doc: jsPDF,
  label: string,
  rightX: number,
  baselineY: number,
  badgeColors: PdfStatusBadgeColors,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const badgeWidth = doc.getTextWidth(label) + 7;
  const badgeHeight = 5.5;

  doc.setFillColor(...badgeColors.fill);
  doc.setDrawColor(...badgeColors.fill);
  doc.roundedRect(
    rightX - badgeWidth,
    baselineY - 4,
    badgeWidth,
    badgeHeight,
    1.2,
    1.2,
    "F",
  );

  doc.setTextColor(...badgeColors.text);
  doc.text(label, rightX - badgeWidth + 3.5, baselineY);
}

/**
 * Logo/org on the left; document title, number, and status chip on the right.
 * Returns the Y cursor below the header block.
 */
export function drawDocumentHeader(
  doc: jsPDF,
  options: {
    colors: PdfBrandPalette;
    logo: PdfLogo | null;
    organizationName: string;
    title: string;
    documentNumber: string;
    statusLabel: string;
    statusColors: PdfStatusBadgeColors;
    startY?: number;
  },
): number {
  const { pageWidth, margin } = getPdfPageMetrics(doc);
  const {
    colors,
    logo,
    organizationName,
    title,
    documentNumber,
    statusLabel,
    statusColors,
    startY = 12,
  } = options;

  let leftBottom = startY;

  if (logo) {
    const maxWidth = 40;
    const maxHeight = 12;
    const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    const format = logo.dataUrl.includes("image/png") ? "PNG" : "JPEG";
    doc.addImage(logo.dataUrl, format, margin, startY, logoWidth, logoHeight);
    leftBottom = startY + logoHeight;
  } else if (organizationName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...colors.primary);
    doc.text(organizationName, margin, startY + 6);
    leftBottom = startY + 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...colors.bodyText);
  doc.text(title, pageWidth - margin, startY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.mutedText);
  doc.text(documentNumber, pageWidth - margin, startY + 11, {
    align: "right",
  });

  drawStatusBadge(
    doc,
    statusLabel,
    pageWidth - margin,
    startY + 18,
    statusColors,
  );

  return Math.max(leftBottom, startY + 22) + 6;
}

/** Quiet label/value meta strip with a bottom hairline (no filled card). */
export function drawMetaStrip(
  doc: jsPDF,
  options: {
    colors: PdfBrandPalette;
    fields: PdfMetaField[];
    y: number;
  },
): number {
  const { margin, contentWidth } = getPdfPageMetrics(doc);
  const { colors, fields, y } = options;
  if (fields.length === 0) {
    return y;
  }

  const colWidth = contentWidth / fields.length;
  fields.forEach((field, index) => {
    const x = margin + index * colWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.mutedText);
    doc.text(field.label.toUpperCase(), x, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.bodyText);
    doc.text(field.value, x, y + 5);
  });

  const bottomY = y + 10;
  doc.setDrawColor(...lightenRgb(colors.cardBorder, 0.35));
  doc.setLineWidth(0.25);
  doc.line(margin, bottomY, margin + contentWidth, bottomY);

  return bottomY + 8;
}

/**
 * Open Bill-to / Details columns with a light fill band and no twin cards.
 * Returns the Y cursor below the block.
 */
export function drawPartyColumns(
  doc: jsPDF,
  options: {
    colors: PdfBrandPalette;
    left: PdfPartyColumn;
    right: PdfPartyColumn;
    y: number;
  },
): number {
  const { margin, contentWidth } = getPdfPageMetrics(doc);
  const { colors, left, right, y } = options;
  const gap = 8;
  const colWidth = (contentWidth - gap) / 2;
  const lineHeight = 4.5;

  const measureColumn = (column: PdfPartyColumn) => {
    const primary = column.primary?.trim() ?? "";
    const lineCount =
      (primary ? 1 : 0) + (column.lines?.length ?? 0);
    return 7 + Math.max(lineCount, 1) * lineHeight;
  };

  const blockHeight = Math.max(
    22,
    Math.max(measureColumn(left), measureColumn(right)) + 4,
  );

  doc.setFillColor(...lightenRgb(colors.primary, 0.96));
  doc.roundedRect(margin, y, contentWidth, blockHeight, 1.5, 1.5, "F");

  const drawColumn = (column: PdfPartyColumn, x: number) => {
    let cursor = y + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.mutedText);
    doc.text(column.title.toUpperCase(), x, cursor);

    cursor += 5.5;
    const primary = column.primary?.trim() ?? "";
    if (primary) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.bodyText);
      const primaryLines = doc.splitTextToSize(primary, colWidth - 4);
      doc.text(primaryLines, x, cursor);
      cursor += primaryLines.length * 4.5;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.mutedText);
    for (const line of column.lines ?? []) {
      const wrapped = doc.splitTextToSize(line, colWidth - 4);
      doc.text(wrapped, x, cursor);
      cursor += wrapped.length * lineHeight;
    }
  };

  drawColumn(left, margin + 4);
  drawColumn(right, margin + colWidth + gap + 4);

  return y + blockHeight + 8;
}

export function getLineItemsColumnStyles(
  showPaymentSplit: boolean,
): { [key: string]: Partial<Styles> } {
  if (showPaymentSplit) {
    return {
      0: { cellWidth: 18 },
      1: { cellWidth: "auto" },
      2: { halign: "right", cellWidth: 12 },
      3: { halign: "right", cellWidth: 22 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 22 },
      6: { halign: "right", fontStyle: "bold", cellWidth: 24 },
    };
  }

  return {
    0: { cellWidth: 18 },
    1: { cellWidth: "auto" },
    2: { halign: "right", cellWidth: 12 },
    3: { halign: "right", cellWidth: 22 },
    4: { halign: "right", fontStyle: "bold", cellWidth: 24 },
  };
}

/** Shared modern line-items table styles (light header, hairlines, stripes). */
export function buildLineItemsTableOptions(
  options: {
    colors: PdfBrandPalette;
    startY: number;
    head: string[];
    body: string[][];
    showPaymentSplit: boolean;
    margin: number;
  },
): UserOptions {
  const { colors, startY, head, body, showPaymentSplit, margin } = options;
  const headerFill = lightenRgb(colors.primary, 0.9);

  return {
    startY,
    head: [head],
    body,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3.5, right: 2.5, bottom: 3.5, left: 2.5 },
      lineColor: lightenRgb(colors.cardBorder, 0.4),
      lineWidth: 0.15,
      textColor: colors.bodyText,
      valign: "middle",
    },
    headStyles: {
      fillColor: headerFill,
      textColor: colors.bodyText,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      lineColor: lightenRgb(colors.cardBorder, 0.4),
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: lightenRgb(colors.primary, 0.98),
    },
    columnStyles: getLineItemsColumnStyles(showPaymentSplit),
    margin: { left: margin, right: margin },
    tableLineColor: lightenRgb(colors.cardBorder, 0.4),
    tableLineWidth: 0.15,
  };
}

export function getLastAutoTableFinalY(doc: jsPDF, fallbackY: number): number {
  return (doc as DocWithAutoTable).lastAutoTable?.finalY ?? fallbackY;
}

/**
 * Right-aligned totals stack with hairline separators and one emphasized total.
 * No filled card chrome.
 */
export function drawTotalsStack(
  doc: jsPDF,
  options: {
    colors: PdfBrandPalette;
    rows: PdfTotalRow[];
    startY: number;
    width?: number;
  },
): number {
  const { pageWidth, margin } = getPdfPageMetrics(doc);
  const { colors, rows, startY } = options;
  const boxWidth = options.width ?? 70;
  const boxX = pageWidth - margin - boxWidth;
  let y = startY + 4;

  for (const row of rows) {
    if (row.emphasized) {
      y += 1;
      doc.setDrawColor(...lightenRgb(colors.cardBorder, 0.25));
      doc.setLineWidth(0.3);
      doc.line(boxX, y - 3, boxX + boxWidth, y - 3);
      y += 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.bodyText);
      doc.text(row.label, boxX, y);
      doc.text(row.value, boxX + boxWidth, y, { align: "right" });
      y += 7;
      continue;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.mutedText);
    doc.text(row.label, boxX, y);
    doc.setTextColor(...colors.bodyText);
    doc.text(row.value, boxX + boxWidth, y, { align: "right" });
    y += 5.5;
  }

  return y;
}

/** Muted footer without a thick brand bar. */
export function drawDocumentFooter(
  doc: jsPDF,
  options: {
    colors: PdfBrandPalette;
    organizationName: string;
    documentLabel: string;
  },
) {
  const { pageWidth, pageHeight, margin } = getPdfPageMetrics(doc);
  const { colors, organizationName, documentLabel } = options;

  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const footerY = pageHeight - 12;

  doc.setDrawColor(...lightenRgb(colors.cardBorder, 0.35));
  doc.setLineWidth(0.25);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.mutedText);

  const footerLeft = organizationName
    ? `${organizationName} · Generated ${generatedAt}`
    : `Generated ${generatedAt}`;

  doc.text(footerLeft, margin, footerY);
  doc.text(documentLabel, pageWidth - margin, footerY, { align: "right" });
}
