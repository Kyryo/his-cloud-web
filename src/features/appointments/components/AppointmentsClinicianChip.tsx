import {
  getClinicianInitials,
  getClinicianTone,
  UNASSIGNED_CLINICIAN_TONE,
} from "@/features/appointments/utils/appointment-clinician-tones";
import { cn } from "@/lib/utils";

type AppointmentsClinicianChipProps = {
  name: string | null | undefined;
  className?: string;
};

export function AppointmentsClinicianChip({
  name,
  className,
}: AppointmentsClinicianChipProps) {
  const clinicianName = name?.trim() ?? "";
  const assigned = clinicianName.length > 0;
  const tone = assigned
    ? getClinicianTone(clinicianName)
    : UNASSIGNED_CLINICIAN_TONE;
  const initials = assigned ? getClinicianInitials(clinicianName) || "?" : "?";

  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tracking-tight",
          tone.avatar,
        )}
      >
        {initials}
      </span>
      <span className={cn("truncate text-xs font-semibold", tone.name)}>
        {assigned ? clinicianName : "Unassigned"}
      </span>
    </span>
  );
}
