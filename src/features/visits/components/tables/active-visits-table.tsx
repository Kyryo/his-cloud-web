"use client";

import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import type { VisitDetail } from "@/features/visits/types/visit.types";

const columns: InventoryListTableColumn<VisitDetail>[] = [
  {
    key: "patient",
    label: "Client",
    cellClassName: "font-medium text-brand-navy",
    render: (visit) => visit.customer_name,
  },
  {
    key: "service",
    label: "Service",
    render: (visit) => visit.consultation_service_name || "—",
  },
  {
    key: "clinic",
    label: "Clinic",
    render: (visit) => visit.clinic_name || "—",
  },
  {
    key: "status",
    label: "Status",
    render: (visit) => <CustomerVisitStatusBadge status={visit.status} />,
  },
  {
    key: "visit_date",
    label: "Started",
    render: (visit) => formatDisplayDateTime(visit.visit_date),
  },
];

type ActiveVisitsTableProps = {
  visits: VisitDetail[];
  onRowClick?: (visit: VisitDetail) => void;
};

export function ActiveVisitsTable({ visits, onRowClick }: ActiveVisitsTableProps) {
  return (
    <InventoryListTable
      items={visits}
      columns={columns}
      getRowKey={(visit) => visit.uuid}
      onRowClick={onRowClick}
    />
  );
}
