import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { AppIcon } from "@/components/icons/app-icon";
import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AppointmentDetailSheetHeaderProps = {
  appointment: Appointment | null;
  isLoading: boolean;
  showConfirm: boolean;
  showCancel: boolean;
  onViewClient: () => void;
  onConfirm?: () => void;
  onCancelAppointment?: () => void;
};

export function AppointmentDetailSheetHeader({
  appointment,
  isLoading,
  showConfirm,
  showCancel,
  onViewClient,
  onConfirm,
  onCancelAppointment,
}: AppointmentDetailSheetHeaderProps) {
  if (!appointment) {
    return (
      <div className="border-b border-dash-border/60 px-6 py-5 pr-14">
        <p className="text-base font-semibold text-brand-navy">
          Appointment details
        </p>
        <p className="mt-0.5 text-sm text-dash-muted">
          {isLoading ? "Loading…" : "Unavailable"}
        </p>
      </div>
    );
  }

  const showMore = Boolean(onConfirm || onCancelAppointment);

  return (
    <div className="flex items-start gap-3 border-b border-dash-border/60 px-6 py-5 pr-14">
      <UserIdenticon
        seed={appointment.patient || appointment.patient_name}
        name={appointment.patient_name}
        className="size-11 shrink-0 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-brand-navy">
          {appointment.patient_name}
        </p>
        <Link
          href={ROUTES.customerDetail(appointment.patient)}
          onClick={onViewClient}
          className="mt-0.5 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
        >
          View client
          <AppIcon name="chevronRight" size={14} />
        </Link>
      </div>
      {showMore ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-8 rounded-full text-dash-muted"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn(appFont.className, "w-44")}>
            {showConfirm && onConfirm ? (
              <DropdownMenuItem onClick={onConfirm}>Confirm</DropdownMenuItem>
            ) : null}
            {showCancel && onCancelAppointment ? (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={onCancelAppointment}
              >
                Cancel appointment
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
