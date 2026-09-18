"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { useCreateCurrentMedication } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  currentMedicationSchema,
  type CurrentMedicationFormValues,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddCurrentMedicationDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCurrentMedicationDialog({
  visitUuid,
  encounterUuid,
  open,
  onOpenChange,
}: AddCurrentMedicationDialogProps) {
  const { toast } = useToast();
  const createMedication = useCreateCurrentMedication(visitUuid, encounterUuid);
  const form = useForm<CurrentMedicationFormValues>({
    resolver: zodResolver(currentMedicationSchema),
    defaultValues: {
      name: "",
      dose: "",
      route: "",
      frequency: "",
      instructions: "",
      notes: "",
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add current medication</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await createMedication.mutateAsync({
                ...values,
                status: "active",
                started_at: new Date().toISOString(),
              });
              toast({
                title: "Current medication added",
                variant: "success",
              });
              form.reset();
              onOpenChange(false);
            } catch (error) {
              toast({
                title: "Could not add medication",
                description:
                  error instanceof BffError
                    ? formatBffErrorMessage(error.message, error.errors)
                    : "Unable to save this current medication.",
                variant: "error",
              });
            }
          })}
        >
          <div className="space-y-1.5">
            <Label>
              Name
              <RequiredFieldMarker />
            </Label>
            <Input {...form.register("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Dose</Label>
            <Input {...form.register("dose")} />
          </div>
          <div className="space-y-1.5">
            <Label>Route</Label>
            <Input {...form.register("route")} />
          </div>
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Input {...form.register("frequency")} />
          </div>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={createMedication.isPending}>
              Save
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
