import type { SalesOrder, SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";
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
import { formatSalesOrderStateLabel } from "@/features/sales-orders/utils/sales-order-status";
import {
  formatSalesOrderInsurerDueLabel,
  sumSalesOrderClientDue,
  sumSalesOrderInsurerDue,
} from "@/features/sales-orders/utils/sum-sales-order-billing";

function formatPdfAmount(
  value: string | number | null | undefined,
  currency: string,
): string {
  const formatted = formatSalesOrderAmount(value, currency);
  return formatted === "—" ? "0.00" : formatted;
}

function buildDocumentName(order: SalesOrder): string {
  const label = (order.name || `Order_${order.id}`).replace(/\s+/g, "_");
  return `SalesOrder_${label}.pdf`;
}

export async function downloadSalesOrderPdf(order: SalesOrder): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;

  const currency = formatSalesOrderCurrency(order);
  const lines = order.lines ?? [];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let cursorY = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SALES ORDER", margin, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(formatSalesOrderStateLabel(order.state), pageWidth - margin, cursorY, {
    align: "right",
  });

  cursorY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Order number", margin, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(order.name || `#${order.id}`, margin + 32, cursorY);

  cursorY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Order date", margin, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(formatSalesOrderDateTime(order.date_order), margin + 32, cursorY);

  cursorY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Clinic", margin, cursorY);
  doc.setFont("helvetica", "normal");
  doc.text(order.clinic_name?.trim() || "—", margin + 32, cursorY);

  cursorY += 10;
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 28, 2, 2, "FD");

  const detailTop = cursorY + 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("BILL TO", margin + 4, detailTop);
  doc.text("ORDER DETAILS", pageWidth / 2 + 4, detailTop);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(formatSalesOrderCustomer(order), margin + 4, detailTop + 6);

  const insuranceLabel = formatSalesOrderInsuranceLabel(order);
  const insuranceNumber = formatSalesOrderInsuranceNumber(order);
  if (insuranceLabel !== "—") {
    doc.text(`Insurance: ${insuranceLabel}`, margin + 4, detailTop + 12);
  }
  if (insuranceNumber !== "—") {
    doc.text(`Membership no.: ${insuranceNumber}`, margin + 4, detailTop + 18);
  }

  doc.text(`Pricelist: ${order.pricelist_name?.trim() || "—"}`, pageWidth / 2 + 4, detailTop + 6);
  if (order.provider_name?.trim()) {
    doc.text(`Provider: ${order.provider_name}`, pageWidth / 2 + 4, detailTop + 12);
  }
  if (order.client_order_ref?.trim()) {
    doc.text(`Reference: ${order.client_order_ref}`, pageWidth / 2 + 4, detailTop + 18);
  }

  cursorY += 36;
  doc.setTextColor(17, 24, 39);

  autoTable(doc, {
    startY: cursorY,
    head: [["Code", "Item", "Qty", "Unit price", "Insurer", "Client", "Total"]],
    body: lines.map((line: SalesOrderLine) => [
      line.tariff_code?.trim() || "—",
      line.product_name?.trim() || line.name,
      String(line.quantity),
      formatPdfAmount(line.price_unit, currency),
      formatPdfAmount(line.insurer_due, currency),
      formatPdfAmount(line.client_due, currency),
      formatPdfAmount(line.price_total, currency),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
  });

  const tableEndY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ??
    cursorY + 20;
  let totalsY = tableEndY + 8;
  const totalsX = pageWidth - margin - 58;

  const totalRows: Array<[string, string]> = [
    [formatSalesOrderInsurerDueLabel(order), formatPdfAmount(sumSalesOrderInsurerDue(order), currency)],
    ["Client due", formatPdfAmount(sumSalesOrderClientDue(order), currency)],
    ["Gross amount", formatPdfAmount(order.amount_untaxed, currency)],
    ["Tax", formatPdfAmount(order.amount_tax, currency)],
    ["Total", formatPdfAmount(order.amount_total, currency)],
  ];

  doc.setFontSize(9);
  for (const [label, value] of totalRows) {
    const isTotal = label === "Total";
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.text(label, totalsX, totalsY);
    doc.text(value, pageWidth - margin, totalsY, { align: "right" });
    totalsY += isTotal ? 7 : 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generated on ${new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date())}`,
    margin,
    doc.internal.pageSize.getHeight() - 10,
  );

  doc.save(buildDocumentName(order));
}

export { buildDocumentName as buildSalesOrderPdfFilename };
