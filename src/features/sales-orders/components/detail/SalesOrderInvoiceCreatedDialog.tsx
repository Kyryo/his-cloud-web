"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type NextStepOption = {
  id: "prepare-claim" | "view-invoice";
  title: string;
  description: string;
  icon: "clipboard" | "invoice";
  emphasized?: boolean;
  onSelect: () => void;
  testId: string;
};

type SalesOrderInvoiceCreatedDialogProps = {
  open: boolean;
  invoiceName: string;
  onOpenChange: (open: boolean) => void;
  onPrepareClaim: () => void;
  onViewInvoice: () => void;
};

export function SalesOrderInvoiceCreatedDialog({
  open,
  invoiceName,
  onOpenChange,
  onPrepareClaim,
  onViewInvoice,
}: SalesOrderInvoiceCreatedDialogProps) {
  const options: NextStepOption[] = [
    {
      id: "prepare-claim",
      title: "Prepare Claim",
      description: "Create a draft claim for the invoice.",
      icon: "clipboard",
      emphasized: true,
      onSelect: onPrepareClaim,
      testId: "sales-order-prepare-claim-button",
    },
    {
      id: "view-invoice",
      title: "View Invoice",
      description: `Open ${invoiceName}.`,
      icon: "invoice",
      onSelect: onViewInvoice,
      testId: "sales-order-view-invoice-next-button",
    },
  ];

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invoice was successfully created"
      description="What would you like to do next?"
      className={cn("sm:max-w-lg", appFont.className)}
      contentClassName="px-0 py-0"
      data-testid="sales-order-invoice-created-dialog"
      footer={
        <SecondaryButton
          type="button"
          onClick={() => onOpenChange(false)}
          data-testid="sales-order-invoice-created-close-button"
        >
          Close
        </SecondaryButton>
      }
    >
      <ul
        className="divide-y divide-brand-border"
        data-testid="sales-order-invoice-created-options"
      >
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={option.onSelect}
              className={cn(
                "flex w-full items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50",
                option.emphasized && "bg-brand-tint/40 hover:bg-brand-tint/70",
              )}
              data-testid={option.testId}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border",
                  option.emphasized
                    ? "border-brand-primary/20 bg-white text-brand-primary"
                    : "border-brand-border bg-slate-50 text-brand-navy",
                )}
              >
                <AppIcon name={option.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-brand-navy">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-sm text-brand-muted">
                  {option.description}
                </span>
              </span>
              <AppIcon
                name="chevronRight"
                size={16}
                className="mt-2 shrink-0 text-brand-muted"
              />
            </button>
          </li>
        ))}
      </ul>
    </SectionedDialog>
  );
}
