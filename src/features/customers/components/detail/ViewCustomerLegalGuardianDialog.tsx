"use client";

import { CopyableText } from "@/components/copyable-text";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  CUSTOMER_LEGAL_GUARDIAN_RELATIONSHIP_OPTIONS,
  type CustomerLegalGuardian,
} from "@/features/customers/types/customer-legal-guardian.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ViewCustomerLegalGuardianDialogProps = {
  guardian: CustomerLegalGuardian | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-brand-muted">{label}</dt>
      <dd className="text-right font-medium text-brand-navy">{value}</dd>
    </div>
  );
}

export function ViewCustomerLegalGuardianDialog({
  guardian,
  open,
  onOpenChange,
}: ViewCustomerLegalGuardianDialogProps) {
  if (!guardian) {
    return null;
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={guardian.full_name}
      description="Legal guardian details for this client."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="view-customer-legal-guardian-dialog"
      footer={
        <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
          Close
        </SecondaryButton>
      }
    >
      <div className="space-y-4 rounded-xl border border-brand-border bg-slate-50/60 p-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{formatRelationship(guardian.relationship)}</Badge>
          {guardian.is_primary ? (
            <Badge variant="secondary">Primary</Badge>
          ) : null}
        </div>

        <dl className="space-y-3">
          <DetailRow label="Phone" value={guardian.phone_number || "—"} />
          <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-brand-muted">Email</dt>
            <dd className="min-w-0 text-right font-medium text-brand-navy">
              {guardian.email ? (
                <CopyableText
                  value={guardian.email}
                  className="justify-end"
                  copyLabel="Copy email to clipboard"
                  copiedToastMessage="You have copied the guardians email address."
                  alwaysShowCopy
                />
              ) : (
                "—"
              )}
            </dd>
          </div>
          <DetailRow label="National ID" value={guardian.national_id || "—"} />
          <DetailRow label="Notes" value={guardian.notes || "—"} />
        </dl>
      </div>
    </SectionedDialog>
  );
}
