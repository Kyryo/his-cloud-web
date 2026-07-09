import {
  loadLogoForPdf,
  loadPdfBrandingContext,
  lightenRgb,
  type PdfBrandPalette,
} from "@/lib/pdf-branding";
import type { InvoiceLine } from "@/features/invoices/types/invoice.types";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from "@/features/invoices/utils/format-invoice";
import type { Payment } from "@/features/payments/types/payment.types";
import {
  formatPaymentAmount,
  formatPaymentCustomer,
  formatPaymentDate,
  formatPaymentMethod,
} from "@/features/payments/utils/format-payment";

const DEFAULT_CURRENCY = "MWK";

function formatPdfAmount(value: string | number | null | undefined): string {
  const formatted = formatInvoiceAmount(value);
  return formatted === "—" ? "0.00" : formatted;
}

function buildDocumentName(payment: Payment): string {
  const label = (payment.name || `Payment_${payment.id}`).replace(/\s+/g, "_");
  return `Receipt_${label}.pdf`;
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

function drawOrganizationHeader(
  doc: import("jspdf").jsPDF,
  branding: Awaited<ReturnType<typeof loadPdfBrandingContext>>,
  logo: Awaited<ReturnType<typeof loadLogoForPdf>>,
  payment: Payment,
  margin: number,
  pageWidth: number,
  startY: number,
): number {
  const { colors } = branding;
  let cursorY = startY;

  if (logo) {
    const maxWidth = 42;
    const maxHeight = 14;
    const scale = Math.min(maxWidth / logo.width, maxHeight / logo.height);
    const logoWidth = logo.width * scale;
    const logoHeight = logo.height * scale;
    const format = logo.dataUrl.includes("image/png") ? "PNG" : "JPEG";
    doc.addImage(logo.dataUrl, format, margin, cursorY - 2, logoWidth, logoHeight);
    cursorY += logoHeight + 2;
  } else if (branding.organizationName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.text(branding.organizationName, margin, cursorY + 4);
    cursorY += 8;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.mutedText);

  const contactLines = [
    branding.organizationAddress,
    branding.organizationPhone,
    branding.organizationEmail,
  ].filter(Boolean);

  for (const line of contactLines) {
    doc.text(line, margin, cursorY);
    cursorY += 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...colors.primary);
  doc.text("Payment Receipt", pageWidth - margin, startY + 2, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.mutedText);
  doc.text(payment.name || `#${payment.id}`, pageWidth - margin, startY + 8, {
    align: "right",
  });

  return Math.max(cursorY, startY + 14) + 6;
}

function formatTariffCode(line: InvoiceLine): string {
  return line.tariff_code?.trim() || "—";
}

export async function downloadPaymentReceiptPdf(payment: Payment): Promise<void> {
  const invoice =
    payment.invoice_id != null ? await fetchInvoice(payment.invoice_id).catch(() => null) : null;
  const [{ jsPDF }, autoTableModule, branding] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadPdfBrandingContext(),
  ]);
  const autoTable = autoTableModule.default;
  const logo = await loadLogoForPdf(branding.branding_logo_url);
  const { colors } = branding;
  const currency = DEFAULT_CURRENCY;
  const lines = (invoice?.lines ?? []).filter((line) => line.is_payable !== false);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 14, "F");

  let cursorY = drawOrganizationHeader(doc, branding, logo, payment, margin, pageWidth, 22);

  const metaCardHeight = 22;
  drawSectionCard(doc, margin, cursorY, contentWidth, metaCardHeight, colors);

  const metaY = cursorY + 6;
  const metaColWidth = contentWidth / 2;
  const paymentReference = payment.invoice_name || payment.name || `Payment #${payment.id}`;
  const metaFields: Array<[string, string]> = [
    ["Date", formatPaymentDate(payment.payment_date)],
    ["Received from", formatPaymentCustomer(payment)],
    [
      "Payment for",
      `Sum of ${formatPaymentAmount(payment.amount)} being payment for ${paymentReference}`,
    ],
    [
      "Received by",
      payment.recorded_by_name?.trim() || "—",
    ],
    ["Method", formatPaymentMethod(payment.payment_method)],
  ];

  metaFields.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + 4 + column * metaColWidth;
    const y = metaY + row * 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colors.secondary);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.bodyText);
    const wrapped = doc.splitTextToSize(value, metaColWidth - 6);
    doc.text(wrapped, x, y + 4);
  });

  cursorY += metaCardHeight + 6;

  if (payment.note?.trim()) {
    const noteHeight = 16;
    drawSectionCard(doc, margin, cursorY, contentWidth, noteHeight, colors);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...colors.secondary);
    doc.text("NOTES", margin + 4, cursorY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...colors.bodyText);
    doc.text(doc.splitTextToSize(payment.note.trim(), contentWidth - 8), margin + 4, cursorY + 11);
    cursorY += noteHeight + 6;
  }

  if (lines.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Item", "Tariff", "Qty", "Unit price", "Total"]],
      body: lines.map((line) => [
        line.name || line.product_name || "—",
        formatTariffCode(line),
        line.quantity,
        formatPdfAmount(line.price_unit),
        formatPdfAmount(line.price_total),
      ]),
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        textColor: colors.bodyText,
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.onPrimary,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: colors.tableStripe,
      },
      theme: "grid",
    });

    cursorY = (doc as import("jspdf").jsPDF & { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY + 6;
  }

  const totalsX = pageWidth - margin - 58;
  drawSectionCard(doc, totalsX - 4, cursorY, 62, 18, colors);
  doc.setFillColor(...lightenRgb(colors.totalHighlight, 0.2));
  doc.roundedRect(totalsX - 4, cursorY, 62, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...colors.secondary);
  doc.text("AMOUNT RECEIVED", totalsX, cursorY + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.text(formatPaymentAmount(payment.amount), totalsX, cursorY + 13);

  if (invoice?.amount_total != null) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.mutedText);
    doc.text(
      `Invoice total ${formatInvoiceAmount(invoice.amount_total, currency)}`,
      totalsX,
      cursorY + 17,
    );
  }

  if (invoice?.invoice_date) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.mutedText);
    doc.text(`Invoice date ${formatInvoiceDate(invoice.invoice_date)}`, margin, cursorY + 12);
  }

  doc.save(buildDocumentName(payment));
}
