"use client";

import { Eye, Loader2, MoreVertical, UserX } from "lucide-react";

import { CopyableText } from "@/components/copyable-text";
import { TableTextCell } from "@/components/table-text-cell";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS,
  type CustomerLegalGuardian,
} from "@/features/customers/types/customer-legal-guardian.types";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";

type CustomerLegalGuardiansTableProps = {
  guardians: CustomerLegalGuardian[];
  voidingUuid: string | null;
  onEdit: (guardian: CustomerLegalGuardian) => void;
  onView: (guardian: CustomerLegalGuardian) => void;
  onVoid: (guardian: CustomerLegalGuardian) => void;
};

function formatRelationship(
  value: CustomerLegalGuardian["relationship"],
): string {
  return (
    CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS.find(
      (option) => option.value === value,
    )?.label ?? value
  );
}

function formatContacts(guardian: CustomerLegalGuardian) {
  if (!guardian.email && !guardian.national_id) {
    return "—";
  }

  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      {guardian.email ? (
        <CopyableText
          value={guardian.email}
          copyLabel="Copy email to clipboard"
          copiedToastMessage="You have copied the guardians email address."
        />
      ) : null}
      {guardian.email && guardian.national_id ? (
        <span className="text-brand-muted">·</span>
      ) : null}
      {guardian.national_id ? (
        <span className="truncate">{guardian.national_id}</span>
      ) : null}
    </span>
  );
}

export function CustomerLegalGuardiansTable({
  guardians,
  voidingUuid,
  onEdit,
  onView,
  onVoid,
}: CustomerLegalGuardiansTableProps) {
  const columns: InventoryListTableColumn<CustomerLegalGuardian>[] = [
    {
      key: "name",
      label: "Name",
      render: (guardian) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TableTextCell className="font-medium text-brand-navy">
              {guardian.full_name}
            </TableTextCell>
            {guardian.is_primary ? (
              <Badge variant="secondary">Primary</Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            {formatRelationship(guardian.relationship)}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone number",
      render: (guardian) => (
        <TableTextCell className="text-brand-slate">
          {guardian.phone_number || "—"}
        </TableTextCell>
      ),
    },
    {
      key: "contacts",
      label: "Contacts",
      render: (guardian) => (
        <div className="min-w-0 max-w-[16rem] text-sm text-brand-slate">
          {formatContacts(guardian)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (guardian) => {
        const isVoiding = voidingUuid === guardian.uuid;

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            <SecondaryButton
              type="button"
              size="sm"
              disabled={isVoiding}
              onClick={() => onEdit(guardian)}
              data-testid={`customer-legal-guardian-edit-${guardian.uuid}`}
            >
              Edit
            </SecondaryButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8 rounded-full"
                  disabled={isVoiding}
                  aria-label={`More actions for ${guardian.full_name}`}
                  data-testid={`customer-legal-guardian-actions-${guardian.uuid}`}
                >
                  {isVoiding ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <MoreVertical className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onView(guardian)}
                  data-testid={`customer-legal-guardian-view-${guardian.uuid}`}
                >
                  <Eye className="size-4" aria-hidden="true" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-700 focus:text-red-700"
                  disabled={isVoiding}
                  onClick={() => onVoid(guardian)}
                  data-testid={`customer-legal-guardian-void-${guardian.uuid}`}
                >
                  <UserX className="size-4" aria-hidden="true" />
                  Void
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <InventoryListTable
      items={guardians}
      columns={columns}
      getRowKey={(guardian) => guardian.uuid}
      onRowClick={onView}
    />
  );
}
