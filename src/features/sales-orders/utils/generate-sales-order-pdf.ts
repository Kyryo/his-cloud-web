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
import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
  formatSalesOrderCustomer,
  formatSalesOrderDateTime,
} from "@/features/sales-orders/utils/format-sales-order";
import {
  formatSalesOrderInsuranceLabel,
  formatSalesOrderInsuranceNumber,
} from "@/features/sales-orders/utils/format-sales-order-insurance";
import { formatSalesOrderProvidersLabel } from "@/features/sales-orders/utils/sales-order-provider";
import { formatSalesOrderStateLabel } from "@/features/sales-orders/utils/sales-order-status";
import {
  formatSalesOrderInsurerDueLabel,
  hasSalesOrderPaymentSplit,
  sumSalesOrderClientDue,
  sumSalesOrderInsurerDue,
} from "@/features/sales-orders/utils/sum-sales-order-billing";

function formatPdfAmount(value: string | number | null | undefined): string {
  const formatted = formatSalesOrderAmount(value);
  return formatted === "—" ? "0.00" : formatted;
}

function formatPdfTotalAmount(
  value: string | number | null | undefined,
  currency: string,
): string {
  const formatted = formatSalesOrderAmount(value, currency);
  return formatted === "—" ? `0.00 ${currency}` : formatted;
}

function buildDocumentName(order: SalesOrder): string {
  const label = (order.name || `Order_${order.id}`).replace(/\s+/g, "_");
  return `SalesOrder_${label}.pdf`;
}

function getStatusColors(
  state: SalesOrder["state"],
  colors: PdfBrandPalette,
): { fill: RgbColor; text: RgbColor } {
  switch (state) {
    case "cancel":
      return { fill: [254, 226, 226], text: [185, 28, 28] };
    case "sale":
    case "done":
      return {
        fill: lightenRgb(colors.accent, 0.82),
        text: colors.primary,
      };
    case "sent":
      return {
        fill: lightenRgb(colors.secondary, 0.82),
        text: colors.secondary,
      };
    default:
      return {
        fill: lightenRgb(colors.secondary, 0.9),
        text: colors.mutedText,
      };
  }
}

export async function generateSalesOrderPdf(
  order: SalesOrder,
): Promise<{ bytes: ArrayBuffer; filename: string }> {
  const [{ jsPDF }, autoTableModule, branding] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadPdfBrandingContext(),
  ]);
  const autoTable = autoTableModule.default;
  const logo = await loadLogoForPdf(branding.branding_logo_url);
  const { colors } = branding;

  const currency = formatSalesOrderCurrency(order) ?? "";
  const lines = order.lines ?? [];
  const showPaymentSplit = hasSalesOrderPaymentSplit(order);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { margin } = getPdfPageMetrics(doc);

  drawAccentBar(doc, colors);

  let cursorY = drawDocumentHeader(doc, {
    colors,
    logo,
    organizationName: branding.organizationName,
    title: "Sales Order",
    documentNumber: order.name || `#${order.id}`,
    statusLabel: formatSalesOrderStateLabel(order.state),
    statusColors: getStatusColors(order.state, colors),
  });

  cursorY = drawMetaStrip(doc, {
    colors,
    y: cursorY,
    fields: [
      {
        label: "Order date",
        value: formatSalesOrderDateTime(order.date_order),
      },
      { label: "Clinic", value: order.clinic_name?.trim() || "—" },
    ],
  });

  const insuranceLabel = formatSalesOrderInsuranceLabel(order);
  const insuranceNumber = formatSalesOrderInsuranceNumber(order);
  const billToLines: string[] = [];
  if (insuranceLabel !== "—") {
    billToLines.push(`Insurance: ${insuranceLabel}`);
  }
  if (insuranceNumber !== "—") {
    billToLines.push(`Membership no.: ${insuranceNumber}`);
  }

  const orderDetailLines: string[] = [
    `Pricelist: ${order.pricelist_name?.trim() || "—"}`,
  ];
  if (
    order.provider_name?.trim() ||
    (order.providers && order.providers.length > 0)
  ) {
    orderDetailLines.push(`Provider: ${formatSalesOrderProvidersLabel(order)}`);
  }
  if (order.client_order_ref?.trim()) {
    orderDetailLines.push(`Reference: ${order.client_order_ref}`);
  }

  cursorY = drawPartyColumns(doc, {
    colors,
    y: cursorY,
    left: {
      title: "Bill to",
      primary: formatSalesOrderCustomer(order),
      lines: billToLines,
    },
    right: {
      title: "Order details",
      lines: orderDetailLines,
    },
  });

  const tableHead = showPaymentSplit
    ? ["Code", "Item", "Qty", "Unit price", "Insurer", "Client", "Total"]
    : ["Code", "Item", "Qty", "Unit price", "Total"];

  const tableBody = lines.map((line: SalesOrderLine) => {
    const row = [
      line.tariff_code?.trim() || "—",
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
        label: formatSalesOrderInsurerDueLabel(order),
        value: formatPdfAmount(sumSalesOrderInsurerDue(order)),
      },
      {
        label: "Client due",
        value: formatPdfAmount(sumSalesOrderClientDue(order)),
      },
    );
  }

  totalRows.push(
    { label: "Gross amount", value: formatPdfAmount(order.amount_untaxed) },
    { label: "Tax", value: formatPdfAmount(order.amount_tax) },
    {
      label: "Total",
      value: formatPdfTotalAmount(order.amount_total, currency),
      emphasized: true,
    },
  );

  drawTotalsStack(doc, {
    colors,
    rows: totalRows,
    startY: tableEndY + 6,
  });

  drawDocumentFooter(doc, {
    colors,
    organizationName: branding.organizationName,
    documentLabel: "Sales order",
  });

  return {
    bytes: doc.output("arraybuffer") as ArrayBuffer,
    filename: buildDocumentName(order),
  };
}

export async function downloadSalesOrderPdf(order: SalesOrder): Promise<void> {
  const { bytes, filename } = await generateSalesOrderPdf(order);
  const { downloadPdfBytes } = await import("@/lib/pdf-merge");
  downloadPdfBytes(new Uint8Array(bytes), filename);
}

export { buildDocumentName as buildSalesOrderPdfFilename };
