import { ROUTES } from "@/constants/routes";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import { inboxItemDescription } from "@/features/notifications/utils/inbox-display";
import type { VisitDetail } from "@/features/visits/types/visit.types";

export type OverviewActivityKind = "visit" | "appointment" | "inbox";

export type OverviewActivityItem = {
  id: string;
  kind: OverviewActivityKind;
  title: string;
  detail: string;
  href: string;
  occurredAt: string;
  statusLabel?: string;
  statusVariant?: "success" | "secondary" | "warning" | "default" | "outline";
  patientName?: string;
  subtitle?: string;
  identifier?: string;
};

export function localTodayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function overviewGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function overviewFirstName(fullName: string | null | undefined): string {
  const first = fullName?.trim().split(/\s+/)[0];
  return first ?? "";
}

export function formatOverviewHeadingDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
}

export function formatOverviewTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatOverviewRelativeTime(
  value: string,
  now = new Date(),
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = now.getTime() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} min ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}h ago`;
  }
  if (diffMs < 2 * day) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function buildOverviewActivityItems({
  visits,
  appointments,
  inbox,
}: {
  visits: VisitDetail[];
  appointments: Appointment[];
  inbox: InboxItem[];
}): OverviewActivityItem[] {
  const visitItems = visits.map((visit) => {
    const isVisitActive = visit.status === "active";
    const isVisitCompleted = visit.status === "completed";
    return {
      id: `visit-${visit.uuid}`,
      kind: "visit" as const,
      title: visit.customer_name || "Visit",
      detail: [visit.clinic_name, formatCustomerVisitStatusLabel(visit.status)]
        .filter(Boolean)
        .join(" · "),
      href: ROUTES.visitDetail(visit.uuid),
      occurredAt: visit.updated_at || visit.created_at || visit.visit_date,
      statusLabel: formatCustomerVisitStatusLabel(visit.status),
      statusVariant: (isVisitActive
        ? "success"
        : isVisitCompleted
          ? "secondary"
          : "outline") as "success" | "secondary" | "outline",
      patientName: visit.customer_name,
      identifier: visit.customer_identifier,
      subtitle: visit.clinic_name || "Clinic Visit",
    };
  });

  const appointmentItems = appointments.map((appointment) => {
    const isApptInProgress = appointment.status === "in_progress";
    const isApptCompleted = appointment.status === "completed";
    return {
      id: `appointment-${appointment.uuid}`,
      kind: "appointment" as const,
      title: appointment.patient_name || "Appointment",
      detail: [
        formatOverviewTime(appointment.scheduled_start),
        appointment.clinician_name,
        appointment.department_name,
      ]
        .filter(Boolean)
        .join(" · "),
      href: appointment.patient
        ? ROUTES.customerDetail(appointment.patient)
        : ROUTES.appointments,
      occurredAt: appointment.scheduled_start || appointment.updated_at,
      statusLabel: appointment.status ? appointment.status.replace(/_/g, " ") : "scheduled",
      statusVariant: (isApptInProgress
        ? "warning"
        : isApptCompleted
          ? "secondary"
          : "default") as "warning" | "secondary" | "default",
      patientName: appointment.patient_name,
      subtitle: [appointment.department_name, appointment.clinician_name]
        .filter(Boolean)
        .join(" · ") || "Consultation",
    };
  });

  const inboxItems = inbox.map((item) => ({
    id: `inbox-${item.id}`,
    kind: "inbox" as const,
    title: item.title,
    detail: inboxItemDescription(item),
    href: item.href || ROUTES.notifications,
    occurredAt: item.occurred_at,
    statusLabel: item.event_type ? item.event_type.replace(/_/g, " ") : "update",
    statusVariant: "outline" as const,
    subtitle: item.category || "System Notice",
  }));

  return [...visitItems, ...appointmentItems, ...inboxItems]
    .toSorted((left, right) => {
      return (
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime()
      );
    })
    .slice(0, 10);
}

export function formatOverviewClientMeta(customer: Customer): string {
  return [customer.customer_identifier, formatCustomerVisitStatusLabel(customer.visit_status)]
    .filter(Boolean)
    .join(" · ");
}

export function overviewClientName(customer: Customer): string {
  return formatCustomerName(customer);
}
