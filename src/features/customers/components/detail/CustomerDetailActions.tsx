"use client";

import { Loader2, MoreVertical, Pencil, UserX } from "lucide-react";
import { useState } from "react";

import { DestructiveButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchCustomer,
  voidCustomer,
} from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ACTIVE_VISIT_VOID_BLOCK_REASON =
  "Close the active visit before voiding this client.";

type CustomerDetailActionsProps = {
  customer: Customer;
  onEditDetails: () => void;
  onCustomerUpdated: (customer: Customer) => void;
  className?: string;
};

export function CustomerDetailActions({
  customer,
  onEditDetails,
  onCustomerUpdated,
  className,
}: CustomerDetailActionsProps) {
  const { toast } = useToast();
  const [voidConfirmOpen, setVoidConfirmOpen] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);

  const hasActiveVisit = isCustomerVisitActive(customer.visit_status);
  const showVoid = customer.is_active;
  const canVoid = showVoid && !hasActiveVisit;
  const voidBlockReason = hasActiveVisit
    ? ACTIVE_VISIT_VOID_BLOCK_REASON
    : null;
  const customerName = formatCustomerName(customer);

  async function handleVoid() {
    if (!canVoid) {
      return;
    }

    setIsVoiding(true);
    try {
      await voidCustomer(customer.uuid);
      const refreshed = await fetchCustomer(customer.uuid);
      onCustomerUpdated(refreshed);
      setVoidConfirmOpen(false);
      toast({
        variant: "success",
        title: "Client voided",
        description: `${customerName} is now inactive.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not void client",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : getErrorMessage(error),
      });
    } finally {
      setIsVoiding(false);
    }
  }

  return (
    <>
      <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={isVoiding}
              aria-label="Client actions"
              data-testid="customer-actions-menu-button"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onEditDetails}
              data-testid="customer-edit-details-menu-item"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit details
            </DropdownMenuItem>
            {showVoid ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={!canVoid || isVoiding}
                  title={voidBlockReason ?? undefined}
                  className="text-red-700 focus:text-red-700"
                  onClick={() => {
                    if (!canVoid) {
                      return;
                    }
                    setVoidConfirmOpen(true);
                  }}
                  data-testid="customer-void-menu-item"
                >
                  {isVoiding ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <UserX className="size-4" aria-hidden="true" />
                  )}
                  Void client
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={voidConfirmOpen} onOpenChange={setVoidConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void client?</DialogTitle>
            <DialogDescription>
              This will inactivate {customerName}&apos;s account. The client
              record is kept, but they will be marked inactive.
            </DialogDescription>
          </DialogHeader>
          {voidBlockReason ? (
            <p className="text-sm text-red-700">{voidBlockReason}</p>
          ) : null}
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isVoiding}
              onClick={() => setVoidConfirmOpen(false)}
            >
              Keep active
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={!canVoid || isVoiding}
              onClick={() => void handleVoid()}
              data-testid="customer-void-confirm-button"
            >
              {isVoiding ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Voiding...
                </>
              ) : (
                "Void client"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
