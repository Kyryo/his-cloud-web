import {
  loadLogoForPdf,
  loadPdfBrandingContext,
  lightenRgb,
  type PdfBrandPalette,
  type RgbColor,
} from "@/lib/pdf-branding";
import type { Invoice, InvoiceLine } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceAmount,
  formatInvoiceCustomer,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import { formatInvoiceStateLabel } from "@/features/invoices/utils/invoice-status";
import {
  formatInvoiceInsurerDueLabel,
  hasInvoicePaymentSplit,
  sumInvoiceClientDue,
  sumInvoiceExcess,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";

const DEFAULT_CURRENCY = "MWK";

function formatPdfAmount(value: string | number | null | undefined): string {
  const formatted = formatInvoiceAmount(value);
  return formatted === "—" ? "0.00" : formatted;
}

function formatPdfTotalAmount(
  value: string | number | null | undefined,
  currency: string,
): string {
  const formatted = formatInvoiceAmount(value, currency);
  return formatted === "—" ? `0.00 ${currency}` : formatted;
}

function formatTariffCode(line: InvoiceLine): string {
  return line.tariff_code?.trim() || "—";
}

function buildDocumentName(invoice: Invoice): string {
  const label = (invoice.name || `Invoice_${invoice.id}`).replace(/\s+/g, "_");
  return `Invoice_${label}.pdf`;
}

function getPaymentStatusColors(
  status: Invoice["payment_status"],
  colors: PdfBrandPalette,
): { fill: RgbColor; text: RgbColor } {
  switch (String(status || "").toLowerCase()) {
    case "paid":
      return {
        fill: lightenRgb(colors.accent, 0.82),
        text: colors.primary,
      };
    case "partially_paid":
      return {
        fill: lightenRgb(colors.secondary, 0.82),
        text: colors.secondary,
      };
    case "overpaid":
      return { fill: [254, 243, 199], text: [180, 83, 9] };
    case "not_paid":
    default:
      return {
        fill: lightenRgb(colors.secondary, 0.9),
        text: colors.mutedText,
      };
  }
}

function drawSectionCard(
  doc: import("jspdf").jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: PdfBrandPalette,
) {
  doc.setDrawColor(...colors.cardBorder);
  doc.setFillColor(...colors.cardFill);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");
}

function drawStatusBadge(
  doc: import("jspdf").jsPDF,
  label: string,
  x: number,
  y: number,
  status: Invoice["payment_status"],
  colors: PdfBrandPalette,
) {
  const { fill, text } = getPaymentStatusColors(status, colors);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const badgeWidth = doc.getTextWidth(label) + 8;
  const badgeHeight = 6;

  doc.setFillColor(...fill);
  doc.setDrawColor(...fill);
  doc.roundedRect(x - badgeWidth, y - 4.5, badgeWidth, badgeHeight, 1.5, 1.5, "F");

  doc.setTextColor(...text);
  doc.text(label, x - badgeWidth + 4, y);
}

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const [{ jsPDF }, autoTableModule, branding] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadPdfBrandingContext(),
  ]);
  const autoTable = autoTableModule.default;
  const logo = await loadLogoForPdf(branding.branding_logo_url);
  const { colors } = branding;

  const currency = DEFAULT_CURRENCY;
  const lines = invoice.lines ?? [];
  const showPaymentSplit = hasInvoicePaymentSplit(invoice);
  const excessTotal = sumInvoiceExcess(invoice);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 14, "F");

  let cursorY = 22;

  if (logo) {
    const maxWidth = 42;
    const maxHeight = 14;
    const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    const format = logo.dataUrl.includes("image/png") ? "PNG" : "JPEG";
    doc.addImage(logo.dataUrl, format, margin, cursorY - 2, logoWidth, logoHeight);
  } else if (branding.organizationName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.text(branding.organizationName, margin, cursorY + 4);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...colors.primary);
  doc.text("Invoice", pageWidth - margin, cursorY + 2, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.mutedText);
  doc.text(invoice.name || `#${invoice.id}`, pageWidth - margin, cursorY + 8, {
    align: "right",
  });

  const statusLabel = formatInvoicePaymentStatusLabel(invoice.payment_status);
  drawStatusBadge(
    doc,
    statusLabel,
    pageWidth - margin,
    cursorY + 14,
    invoice.payment_status,
    colors,
  );

  cursorY += 22;

  const metaCardHeight = 16;
  drawSectionCard(doc, margin, cursorY, contentWidth, metaCardHeight, colors);

  const metaY = cursorY + 6;
  const metaColWidth = contentWidth / 2;
  const metaFields: Array<[string, string]> = [
    ["Invoice date", formatInvoiceDate(invoice.invoice_date)],
    ["State", formatInvoiceStateLabel(invoice.state)],
  ];

  metaFields.forEach(([label, value], index) => {
    const x = margin + 4 + index * metaColWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colors.secondary);
    doc.text(label.toUpperCase(), x, metaY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.bodyText);
    doc.text(value, x, metaY + 5);
  });

  cursorY += metaCardHeight + 6;

  const detailCardHeight = 30;
  const detailColWidth = (contentWidth - 4) / 2;
  drawSectionCard(doc, margin, cursorY, detailColWidth, detailCardHeight, colors);
  drawSectionCard(
    doc,
    margin + detailColWidth + 4,
    cursorY,
    detailColWidth,
    detailCardHeight,
    colors,
  );

  const detailTop = cursorY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...colors.secondary);
  doc.text("BILL TO", margin + 4, detailTop);
  doc.text("INVOICE DETAILS", margin + detailColWidth + 8, detailTop);

  doc.setTextColor(...colors.bodyText);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(formatInvoiceCustomer(invoice), margin + 4, detailTop + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let billToY = detailTop + 12;
  const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
  const insuranceNumber = formatInvoiceInsuranceNumber(invoice);
  if (insuranceLabel !== "—") {
    doc.text(`Insurance: ${insuranceLabel}`, margin + 4, billToY);
    billToY += 5;
  }
  if (insuranceNumber !== "—") {
    doc.text(`Membership no.: ${insuranceNumber}`, margin + 4, billToY);
  }

  let invoiceDetailY = detailTop + 6;
  const invoiceDetails: string[] = [
    `Pricelist: ${invoice.pricelist_name?.trim() || "—"}`,
  ];
  if (invoice.sales_order_name?.trim()) {
    invoiceDetails.push(`Sales order: ${invoice.sales_order_name}`);
  }
  if (invoice.authorization_number?.trim()) {
    invoiceDetails.push(`Authorization: ${invoice.authorization_number}`);
  }
  if (invoice.invoice_origin?.trim()) {
    invoiceDetails.push(`Origin: ${invoice.invoice_origin}`);
  }

  for (const detail of invoiceDetails) {
    doc.text(detail, margin + detailColWidth + 8, invoiceDetailY);
    invoiceDetailY += 5;
  }

  cursorY += detailCardHeight + 8;

  const tableHead = showPaymentSplit
    ? ["Code", "Item", "Qty", "Unit price", "Insurer", "Client", "Total"]
    : ["Code", "Item", "Qty", "Unit price", "Total"];

  const tableBody = lines.map((line) => {
    const row = [
      formatTariffCode(line),
      line.product_name?.trim() || line.name,
      String(line.quantity),
      formatPdfAmount(line.price_unit),
    ];

    if (showPaymentSplit) {
      row.push(
        formatPdfAmount(line.insurer_due),
        formatPdfAmount(line.client_due),
      );
    }

    row.push(formatPdfAmount(line.price_total));
    return row;
  });

  autoTable(doc, {
    startY: cursorY,
    head: [tableHead],
    body: tableBody,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: { top: 3, right: 2.5, bottom: 3, left: 2.5 },
      lineColor: colors.cardBorder,
      lineWidth: 0.1,
      textColor: colors.bodyText,
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.onPrimary,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: colors.tableStripe,
    },
    columnStyles: showPaymentSplit
      ? {
          0: { cellWidth: 18 },
          1: { cellWidth: "auto" },
          2: { halign: "right", cellWidth: 12 },
          3: { halign: "right", cellWidth: 22 },
          4: { halign: "right", cellWidth: 22 },
          5: { halign: "right", cellWidth: 22 },
          6: { halign: "right", fontStyle: "bold", cellWidth: 24 },
        }
      : {
          0: { cellWidth: 18 },
          1: { cellWidth: "auto" },
          2: { halign: "right", cellWidth: 12 },
          3: { halign: "right", cellWidth: 22 },
          4: { halign: "right", fontStyle: "bold", cellWidth: 24 },
        },
    margin: { left: margin, right: margin },
  });

  const tableEndY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
    cursorY + 20;

  const totalsBoxWidth = 72;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  let totalsY = tableEndY + 8;

  const totalRows: Array<[string, string, boolean]> = [];

  if (showPaymentSplit) {
    totalRows.push(
      [
        formatInvoiceInsurerDueLabel(invoice),
        formatPdfAmount(sumInvoiceInsurerDue(invoice)),
        false,
      ],
      ["Client due", formatPdfAmount(sumInvoiceClientDue(invoice)), false],
    );
    if (excessTotal > 0) {
      totalRows.push(["Excess", formatPdfAmount(excessTotal), false]);
    }
  }

  totalRows.push(
    ["Gross amount", formatPdfAmount(invoice.amount_untaxed), false],
    ["Tax", formatPdfAmount(invoice.amount_tax), false],
    ["Total", formatPdfTotalAmount(invoice.amount_total, currency), true],
    ["Paid", formatPdfAmount(invoice.amount_paid), false],
    ["Balance", formatPdfAmount(invoice.amount_residual), false],
  );

  const totalsBoxHeight = 8 + totalRows.length * 6 + 4;
  drawSectionCard(
    doc,
    totalsBoxX,
    totalsY - 4,
    totalsBoxWidth,
    totalsBoxHeight,
    colors,
  );

  totalsY += 2;
  doc.setFontSize(9);
  for (const [label, value, isTotal] of totalRows) {
    if (isTotal) {
      doc.setFillColor(...colors.totalHighlight);
      doc.rect(
        totalsBoxX + 0.5,
        totalsY - 3.5,
        totalsBoxWidth - 1,
        8,
        "F",
      );
      doc.setDrawColor(...colors.cardBorder);
      doc.line(
        totalsBoxX + 3,
        totalsY - 2,
        totalsBoxX + totalsBoxWidth - 3,
        totalsY - 2,
      );
      totalsY += 2;
    }

    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(isTotal ? 10 : 9);
    doc.setTextColor(...(isTotal ? colors.primary : colors.mutedText));
    doc.text(label, totalsBoxX + 4, totalsY);
    doc.text(value, totalsBoxX + totalsBoxWidth - 4, totalsY, { align: "right" });
    totalsY += isTotal ? 7 : 5;
  }

  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const footerY = pageHeight - 10;
  doc.setFillColor(...colors.primary);
  doc.rect(0, pageHeight - 4, pageWidth, 4, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.mutedText);

  const footerLeft = branding.organizationName
    ? `${branding.organizationName} · Generated ${generatedAt}`
    : `Generated ${generatedAt}`;

  doc.text(footerLeft, margin, footerY);
  doc.setTextColor(...colors.secondary);
  doc.text("Invoice", pageWidth - margin, footerY, { align: "right" });

  doc.save(buildDocumentName(invoice));
}

export { buildDocumentName as buildInvoicePdfFilename };
