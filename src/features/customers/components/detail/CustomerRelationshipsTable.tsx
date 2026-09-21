"use client";

import { MoreVertical, UserX } from "lucide-react";

import { TableTextCell } from "@/components/table-text-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CUSTOMER_RELATIONSHIP_LABELS,
  type CustomerRelationship,
  type CustomerRelationshipType,
} from "@/features/customers/types/customer-relationship.types";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";

type CustomerRelationshipsTableProps = {
  relationships: CustomerRelationship[];
  archivingUuid: string | null;
  onArchive: (relationship: CustomerRelationship) => void;
};

function formatRelationship(value: string): string {
  return (
    CUSTOMER_RELATIONSHIP_LABELS[value as CustomerRelationshipType] ?? value
  );
}

function linkedClient(relationship: CustomerRelationship) {
  if (relationship.direction === "outgoing") {
    return {
      name: relationship.related_name,
      identifier: relationship.related_identifier,
      uuid: relationship.related_uuid,
    };
  }
  return {
    name: relationship.principal_name,
    identifier: relationship.principal_identifier,
    uuid: relationship.principal_uuid,
  };
}

export function CustomerRelationshipsTable({
  relationships,
  archivingUuid,
  onArchive,
}: CustomerRelationshipsTableProps) {
  const columns: InventoryListTableColumn<CustomerRelationship>[] = [
    {
      key: "client",
      label: "Client",
      render: (row) => {
        const other = linkedClient(row);
        return (
          <div className="min-w-0">
            <TableTextCell className="font-medium text-brand-navy">
              {other.name}
            </TableTextCell>
            <p className="mt-0.5 text-xs text-brand-muted">
              {other.identifier || other.uuid}
            </p>
          </div>
        );
      },
    },
    {
      key: "relationship",
      label: "Relationship",
      render: (row) => (
        <TableTextCell className="text-brand-slate">
          {formatRelationship(row.relationship)}
        </TableTextCell>
      ),
    },
    {
      key: "direction",
      label: "Link",
      render: (row) => (
        <Badge variant="secondary">
          {row.direction === "outgoing" ? "Dependant" : "Linked from"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      cellClassName: "w-12",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label="Relationship actions"
              disabled={archivingUuid === row.uuid}
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-700 focus:text-red-700"
              disabled={archivingUuid === row.uuid}
              onClick={() => onArchive(row)}
            >
              <UserX className="size-4" aria-hidden="true" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div data-testid="customer-relationships-table">
      <InventoryListTable
        items={relationships}
        columns={columns}
        getRowKey={(row) => row.uuid}
      />
    </div>
  );
}
