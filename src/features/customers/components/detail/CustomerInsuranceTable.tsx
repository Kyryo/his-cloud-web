"use client";

import { TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";

type CustomerInsuranceTableProps = {
  insurance: CustomerInsurance[];
  onUpdate: (record: CustomerInsurance) => void;
};

function InsuranceStatusBadges({ insurance }: { insurance: CustomerInsurance }) {
  if (!insurance.is_active) {
    return <Badge variant="outline">Inactive</Badge>;
  }

  if (insurance.is_primary) {
    return <Badge variant="secondary">Primary</Badge>;
  }

  return <Badge variant="success">Active</Badge>;
}

function membershipNumber(record: CustomerInsurance): string {
  return record.suffix
    ? `${record.membership_number}-${record.suffix}`
    : record.membership_number;
}

export function CustomerInsuranceTable({
  insurance,
  onUpdate,
}: CustomerInsuranceTableProps) {
  const columns: InventoryListTableColumn<CustomerInsurance>[] = [
    {
      key: "company",
      label: "Payer",
      render: (record) => (
        <TableTextCell className="font-medium text-brand-navy">
          {record.insurance_company_name}
        </TableTextCell>
      ),
    },
    {
      key: "scheme",
      label: "Scheme",
      render: (record) => (
        <TableTextCell className="text-brand-slate">{record.scheme_name}</TableTextCell>
      ),
    },
    {
      key: "membership",
      label: "Membership",
      render: (record) => (
        <TableTextCell className="font-mono text-brand-slate">
          {membershipNumber(record)}
        </TableTextCell>
      ),
    },
    {
      key: "member",
      label: "Member type",
      render: (record) => (
        <TableTextCell className="text-brand-slate">
          {record.is_principal_member
            ? "Principal member"
            : record.relationship_to_principal_member || "Dependent"}
        </TableTextCell>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (record) => <InsuranceStatusBadges insurance={record} />,
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (record) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <SecondaryButton
            type="button"
            size="sm"
            onClick={() => onUpdate(record)}
          >
            Update
          </SecondaryButton>
        </div>
      ),
    },
  ];

  return (
    <InventoryListTable
      items={insurance}
      columns={columns}
      getRowKey={(record) => record.uuid}
      onRowClick={onUpdate}
    />
  );
}
