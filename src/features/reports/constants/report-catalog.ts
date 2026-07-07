import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react";

import type { ReportFilterResource } from "@/features/reports/services/report-filter-options.service";

export type ReportCategory = "sales" | "revenue" | "inventory";

export type ReportFilterFieldType =
  | "date"
  | "date_range"
  | "select"
  | "resource"
  | "text";

export type ReportFilterField = {
  name: string;
  label: string;
  type: ReportFilterFieldType;
  options?: Array<{ value: string; label: string }>;
  /** Catalog to populate a `resource` dropdown from. */
  resource?: ReportFilterResource;
  placeholder?: string;
};

export type ReportCatalogItem = {
  id: string;
  reportType: string;
  category: ReportCategory;
  title: string;
  description: string;
  icon: LucideIcon;
  filters: ReportFilterField[];
};

export type ReportCatalogSection = {
  id: ReportCategory;
  title: string;
  description?: string;
  items: ReportCatalogItem[];
};

const REPORT_CATEGORY_META: Record<
  ReportCategory,
  { title: string; description: string }
> = {
  sales: {
    title: "Sales",
    description: "Orders and line-level sales detail.",
  },
  revenue: {
    title: "Revenue",
    description: "Invoices, receivables, and customer payments.",
  },
  inventory: {
    title: "Inventory",
    description: "Purchasing and internal stock movements.",
  },
};

export const REPORT_CATALOG: ReportCatalogItem[] = [
  {
    id: "sales_orders",
    reportType: "sales_orders",
    category: "sales",
    title: "Sales orders",
    description: "Order headers with customer, provider, and amounts.",
    icon: ShoppingCart,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      {
        name: "state",
        label: "State",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "sent", label: "Quotation sent" },
          { value: "sale", label: "Confirmed" },
          { value: "done", label: "Locked" },
          { value: "cancel", label: "Cancelled" },
        ],
      },
      { name: "customer_uuid", label: "Customer", type: "resource", resource: "customers" },
      { name: "provider_uuid", label: "Provider", type: "resource", resource: "providers" },
      { name: "clinic_uuid", label: "Clinic", type: "resource", resource: "clinics" },
    ],
  },
  {
    id: "sales_order_lines",
    reportType: "sales_order_lines",
    category: "sales",
    title: "Sales order lines",
    description: "Line-level product, quantity, and pricing details.",
    icon: FileText,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      { name: "product_uuid", label: "Product", type: "resource", resource: "products" },
      { name: "provider_uuid", label: "Provider", type: "resource", resource: "providers" },
    ],
  },
  {
    id: "invoices",
    reportType: "invoices",
    category: "revenue",
    title: "Invoices",
    description: "Posted invoices with payment totals and balances.",
    icon: Receipt,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      {
        name: "state",
        label: "State",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "posted", label: "Posted" },
          { value: "cancel", label: "Cancelled" },
        ],
      },
      { name: "customer_uuid", label: "Customer", type: "resource", resource: "customers" },
    ],
  },
  {
    id: "receivables_aging",
    reportType: "receivables_aging",
    category: "revenue",
    title: "Receivables aging",
    description: "Open invoice balances grouped by aging bucket.",
    icon: Wallet,
    filters: [
      { name: "as_of_date", label: "As of date", type: "date" },
      { name: "customer_uuid", label: "Customer", type: "resource", resource: "customers" },
      { name: "clinic_uuid", label: "Clinic", type: "resource", resource: "clinics" },
    ],
  },
  {
    id: "payments",
    reportType: "payments",
    category: "revenue",
    title: "Payments",
    description: "Customer payments with method and invoice linkage.",
    icon: FileSpreadsheet,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      {
        name: "state",
        label: "State",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "posted", label: "Posted" },
          { value: "cancel", label: "Cancelled" },
        ],
      },
      { name: "payment_method", label: "Payment method", type: "text" },
      { name: "customer_uuid", label: "Customer", type: "resource", resource: "customers" },
    ],
  },
  {
    id: "purchase_orders",
    reportType: "purchase_orders",
    category: "inventory",
    title: "Purchases",
    description: "Purchase orders with vendor and receiving location.",
    icon: Package,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "DRAFT", label: "Draft" },
          { value: "SUBMITTED", label: "Submitted" },
          { value: "APPROVED", label: "Approved" },
          { value: "CONFIRMED", label: "Confirmed" },
          { value: "CANCELLED", label: "Cancelled" },
        ],
      },
      { name: "supplier", label: "Supplier", type: "resource", resource: "suppliers" },
      { name: "clinic_uuid", label: "Clinic", type: "resource", resource: "clinics" },
    ],
  },
  {
    id: "internal_orders",
    reportType: "internal_orders",
    category: "inventory",
    title: "Internal orders",
    description: "Stock transfers between locations.",
    icon: ArrowLeftRight,
    filters: [
      { name: "date_from", label: "From", type: "date" },
      { name: "date_to", label: "To", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "DRAFT", label: "Draft" },
          { value: "SUBMITTED", label: "Submitted" },
          { value: "APPROVED", label: "Approved" },
          { value: "DISPATCHED", label: "Dispatched" },
          { value: "RECEIVED", label: "Received" },
          { value: "CANCELLED", label: "Cancelled" },
        ],
      },
      {
        name: "source_location_uuid",
        label: "Source location",
        type: "resource",
        resource: "locations",
      },
      {
        name: "destination_location_uuid",
        label: "Destination location",
        type: "resource",
        resource: "locations",
      },
      { name: "clinic_uuid", label: "Clinic", type: "resource", resource: "clinics" },
    ],
  },
];

export function getReportCatalogItem(id: string): ReportCatalogItem | undefined {
  return REPORT_CATALOG.find((item) => item.id === id);
}

export function getReportTypeLabel(reportType: string): string {
  const item = REPORT_CATALOG.find((entry) => entry.reportType === reportType);
  if (item) {
    return item.title;
  }
  return reportType
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

const REPORT_CATEGORY_ORDER: ReportCategory[] = ["sales", "revenue", "inventory"];

export function getReportCatalogSections(): ReportCatalogSection[] {
  return REPORT_CATEGORY_ORDER.map((category) => ({
    id: category,
    title: REPORT_CATEGORY_META[category].title,
    description: REPORT_CATEGORY_META[category].description,
    items: REPORT_CATALOG.filter((item) => item.category === category),
  })).filter((section) => section.items.length > 0);
}
