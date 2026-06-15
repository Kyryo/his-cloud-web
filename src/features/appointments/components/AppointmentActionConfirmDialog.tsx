"use client";

import { Loader2 } from "lucide-react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type AppointmentTableAction = "confirm" | "cancel" | "start";

type AppointmentActionConfirmDialogProps = {
  action: AppointmentTableAction | null;
  appointment: Appointment | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function getConfirmCopy(action: AppointmentTableAction, appointment: Appointment) {
  switch (action) {
    case "confirm":
      return {
        title: "Confirm appointment?",
        description: `Mark ${appointment.patient_name}'s appointment as confirmed.`,
        confirmLabel: "Confirm appointment",
        destructive: false,
      };
    case "cancel":
      return {
        title: "Cancel appointment?",
        description: `Cancel ${appointment.patient_name}'s appointment scheduled for ${new Date(appointment.scheduled_start).toLocaleString()}.`,
        confirmLabel: "Cancel appointment",
        destructive: true,
      };
    case "start":
      return {
        title: "Start visit from appointment?",
        description: `Begin a clinic visit for ${appointment.patient_name} from this appointment.`,
        confirmLabel: "Start visit",
        destructive: false,
      };
  }
}

export function AppointmentActionConfirmDialog({
  action,
  appointment,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: AppointmentActionConfirmDialogProps) {
  const open = Boolean(action && appointment);
  const copy =
    action && appointment ? getConfirmCopy(action, appointment) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>{copy?.title ?? "Confirm action"}</DialogTitle>
          <DialogDescription>{copy?.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Keep as is
          </SecondaryButton>
          {copy?.destructive ? (
            <DestructiveButton
              type="button"
              disabled={isSubmitting}
              className="rounded-full"
              onClick={onConfirm}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Working...
                </>
              ) : (
                copy.confirmLabel
              )}
            </DestructiveButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              className="rounded-full"
              onClick={onConfirm}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Working...
                </>
              ) : (
                copy?.confirmLabel
              )}
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
