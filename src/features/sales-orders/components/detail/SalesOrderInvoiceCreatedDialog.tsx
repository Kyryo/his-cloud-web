"use client";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { NextStepOptionsList } from "@/components/ui/next-step-options-list";
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
      <NextStepOptionsList
        options={options}
        testId="sales-order-invoice-created-options"
      />
    </SectionedDialog>
  );
}
