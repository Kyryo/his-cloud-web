"use client";

import { CalendarPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { customerAppointmentsQueryKey } from "@/features/appointments/hooks/use-customer-appointments";
import type { Customer } from "@/features/customers/types/customer.types";

type OpdEncounterScheduleButtonProps = {
  customer: Customer | null;
};

/**
 * Schedule appointment control for the OPD encounter header.
 * Matches the client-details Schedule button pattern.
 */
export function OpdEncounterScheduleButton({
  customer,
}: OpdEncounterScheduleButtonProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  if (!customer) {
    return null;
  }

  return (
    <>
      <SecondaryButton
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5"
        data-testid="opd-encounter-schedule-button"
      >
        <CalendarPlus className="size-3.5" aria-hidden="true" />
        <span>Schedule</span>
      </SecondaryButton>
      <CreateAppointmentDialog
        customer={customer}
        open={open}
        onOpenChange={setOpen}
        onCreated={async () => {
          setOpen(false);
          await queryClient.invalidateQueries({
            queryKey: customerAppointmentsQueryKey(customer.uuid),
          });
        }}
      />
    </>
  );
}
