"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  PlatformAdminTenant,
  PlatformAdminTenantStatus,
} from "@/features/platform-admin/types/platform-admin.types";

type ActionStatus = Exclude<PlatformAdminTenantStatus, "PENDING">;

export function PlatformAdminStatusDialog({
  tenant,
  status,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: {
  tenant: PlatformAdminTenant | null;
  status: ActionStatus | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  const open = Boolean(tenant && status);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Confirm status change
          </DialogTitle>
          <DialogDescription>
            {tenant && status
              ? `${tenant.name} will be marked ${status.toLowerCase()}.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void onConfirm()} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
