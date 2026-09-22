import {
  loadLogoForPdf,
  loadPdfBrandingContext,
  lightenRgb,
  type PdfBrandPalette,
  type RgbColor,
} from "@/lib/pdf-branding";
import {
  buildLineItemsTableOptions,
  drawAccentBar,
  drawDocumentFooter,
  drawDocumentHeader,
  drawMetaStrip,
  drawPartyColumns,
  drawTotalsStack,
  getLastAutoTableFinalY,
  getPdfPageMetrics,
  type PdfTotalRow,
} from "@/lib/pdf-document-layout";
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

export async function generateInvoicePdf(
  invoice: Invoice,
): Promise<{ bytes: ArrayBuffer; filename: string }> {
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
  const { margin } = getPdfPageMetrics(doc);

  drawAccentBar(doc, colors);

  let cursorY = drawDocumentHeader(doc, {
    colors,
    logo,
    organizationName: branding.organizationName,
    title: "Invoice",
    documentNumber: invoice.name || `#${invoice.id}`,
    statusLabel: formatInvoicePaymentStatusLabel(invoice.payment_status),
    statusColors: getPaymentStatusColors(invoice.payment_status, colors),
  });

  cursorY = drawMetaStrip(doc, {
    colors,
    y: cursorY,
    fields: [
      { label: "Invoice date", value: formatInvoiceDate(invoice.invoice_date) },
      { label: "State", value: formatInvoiceStateLabel(invoice.state) },
    ],
  });

  const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
  const insuranceNumber = formatInvoiceInsuranceNumber(invoice);
  const billToLines: string[] = [];
  if (insuranceLabel !== "—") {
    billToLines.push(`Insurance: ${insuranceLabel}`);
  }
  if (insuranceNumber !== "—") {
    billToLines.push(`Membership no.: ${insuranceNumber}`);
  }

  const invoiceDetailLines: string[] = [
    `Pricelist: ${invoice.pricelist_name?.trim() || "—"}`,
  ];
  if (invoice.sales_order_name?.trim()) {
    invoiceDetailLines.push(`Sales order: ${invoice.sales_order_name}`);
  }
  if (invoice.authorization_number?.trim()) {
    invoiceDetailLines.push(`Authorization: ${invoice.authorization_number}`);
  }
  if (invoice.invoice_origin?.trim()) {
    invoiceDetailLines.push(`Origin: ${invoice.invoice_origin}`);
  }

  cursorY = drawPartyColumns(doc, {
    colors,
    y: cursorY,
    left: {
      title: "Bill to",
      primary: formatInvoiceCustomer(invoice),
      lines: billToLines,
    },
    right: {
      title: "Invoice details",
      lines: invoiceDetailLines,
    },
  });

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

  autoTable(
    doc,
    buildLineItemsTableOptions({
      colors,
      startY: cursorY,
      head: tableHead,
      body: tableBody,
      showPaymentSplit,
      margin,
    }),
  );

  const tableEndY = getLastAutoTableFinalY(doc, cursorY + 20);

  const totalRows: PdfTotalRow[] = [];

  if (showPaymentSplit) {
    totalRows.push(
      {
        label: formatInvoiceInsurerDueLabel(invoice),
        value: formatPdfAmount(sumInvoiceInsurerDue(invoice)),
      },
      {
        label: "Client due",
        value: formatPdfAmount(sumInvoiceClientDue(invoice)),
      },
    );
    if (excessTotal > 0) {
      totalRows.push({
        label: "Excess",
        value: formatPdfAmount(excessTotal),
      });
    }
  }

  totalRows.push(
    { label: "Gross amount", value: formatPdfAmount(invoice.amount_untaxed) },
    { label: "Tax", value: formatPdfAmount(invoice.amount_tax) },
    {
      label: "Total",
      value: formatPdfTotalAmount(invoice.amount_total, currency),
      emphasized: true,
    },
    { label: "Paid", value: formatPdfAmount(invoice.amount_paid) },
    { label: "Balance", value: formatPdfAmount(invoice.amount_residual) },
  );

  drawTotalsStack(doc, {
    colors,
    rows: totalRows,
    startY: tableEndY + 6,
  });

  drawDocumentFooter(doc, {
    colors,
    organizationName: branding.organizationName,
    documentLabel: "Invoice",
  });

  return {
    bytes: doc.output("arraybuffer") as ArrayBuffer,
    filename: buildDocumentName(invoice),
  };
}

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const { bytes, filename } = await generateInvoicePdf(invoice);
  const { downloadPdfBytes } = await import("@/lib/pdf-merge");
  downloadPdfBytes(new Uint8Array(bytes), filename);
}

export { buildDocumentName as buildInvoicePdfFilename };
