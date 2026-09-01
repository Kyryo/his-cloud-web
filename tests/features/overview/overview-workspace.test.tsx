import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ROUTES } from "@/constants/routes";
import type { Appointment } from "@/features/appointments/types/appointment.types";
import type { Customer } from "@/features/customers/types/customer.types";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  OverviewActivityStream,
  OverviewCount,
  OverviewRecentClients,
  OverviewWorkstations,
} from "@/features/overview/components/overview-workspace-sections";
import {
  buildOverviewActivityItems,
  formatOverviewRelativeTime,
  localTodayIso,
  overviewFirstName,
  overviewGreeting,
} from "@/features/overview/utils/overview-workspace";
import type { VisitDetail } from "@/features/visits/types/visit.types";

describe("overview workspace utils", () => {
  it("greets by time of day", () => {
    expect(overviewGreeting(new Date("2026-09-01T08:00:00"))).toBe(
      "Good morning",
    );
    expect(overviewGreeting(new Date("2026-09-01T14:00:00"))).toBe(
      "Good afternoon",
    );
    expect(overviewGreeting(new Date("2026-09-01T19:00:00"))).toBe(
      "Good evening",
    );
  });

  it("uses the first name only", () => {
    expect(overviewFirstName("Ada Lovelace")).toBe("Ada");
    expect(overviewFirstName("  ")).toBe("");
    expect(overviewFirstName(null)).toBe("");
  });

  it("formats a local ISO date without UTC shift", () => {
    expect(localTodayIso(new Date(2026, 8, 1, 1, 0, 0))).toBe("2026-09-01");
  });

  it("merges activity by most recent time", () => {
    const items = buildOverviewActivityItems({
      visits: [
        {
          uuid: "visit-1",
          customer_name: "Chikondi Banda",
          clinic_name: "City Clinic",
          status: "active",
          updated_at: "2026-09-01T10:00:00Z",
          created_at: "2026-09-01T09:00:00Z",
          visit_date: "2026-09-01",
        } as VisitDetail,
      ],
      appointments: [
        {
          uuid: "appt-1",
          patient: "cust-1",
          patient_name: "Mercy Phiri",
          clinician_name: "Dr Banda",
          department_name: "Physio",
          scheduled_start: "2026-09-01T12:00:00Z",
          updated_at: "2026-09-01T08:00:00Z",
        } as Appointment,
      ],
      inbox: [
        {
          id: 9,
          title: "Claim ready",
          body: "Ready to submit",
          href: "/claims/9",
          occurred_at: "2026-09-01T11:00:00Z",
          item_count: 1,
          event_type: "ready_for_submission",
        } as InboxItem,
      ],
    });

    expect(items.map((item) => item.title)).toEqual([
      "Mercy Phiri",
      "Claim ready",
      "Chikondi Banda",
    ]);
    expect(items[0]?.href).toBe(ROUTES.customerDetail("cust-1"));
    expect(items[2]?.href).toBe(ROUTES.visitDetail("visit-1"));
  });

  it("describes relative times", () => {
    const now = new Date("2026-09-01T12:00:00Z");
    expect(formatOverviewRelativeTime("2026-09-01T11:50:00Z", now)).toBe(
      "10 min ago",
    );
    expect(formatOverviewRelativeTime("2026-09-01T10:00:00Z", now)).toBe(
      "2h ago",
    );
    expect(formatOverviewRelativeTime("2026-08-31T12:00:00Z", now)).toBe(
      "Yesterday",
    );
  });
});

describe("overview workspace components", () => {
  it("renders metric counts with pulse indicator and link", () => {
    render(
      <OverviewCount
        label="Active Visits"
        value={12}
        hint="Currently in clinic"
        href={ROUTES.activeVisits}
        indicator="emerald"
        pulse
      />,
    );

    expect(screen.getByText("Active Visits")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Currently in clinic")).toBeInTheDocument();
  });

  it("renders activity stream items and handles empty filter", () => {
    const items = [
      {
        id: "v-1",
        kind: "visit" as const,
        title: "Alice Walker",
        detail: "Main Clinic · Active",
        href: "/visits/v-1",
        occurredAt: "2026-09-01T10:00:00Z",
        statusLabel: "Active",
      },
    ];

    const { rerender } = render(
      <OverviewActivityStream
        items={items}
        selectedKind="all"
        onSelectKind={() => {}}
      />,
    );

    expect(screen.getByText("Alice Walker")).toBeInTheDocument();
    expect(screen.getByText("Main Clinic · Active")).toBeInTheDocument();

    rerender(
      <OverviewActivityStream
        items={items}
        selectedKind="appointment"
        onSelectKind={() => {}}
      />,
    );

    expect(screen.getByText("No activity to display")).toBeInTheDocument();
  });

  it("renders recent clients with avatar, MRN and visit status", () => {
    const clients: Customer[] = [
      {
        id: 1,
        uuid: "c-1",
        tenant: 1,
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        customer_identifier: "MRN-101",
        internal_reference: "",
        phone_number: "+265999000111",
        email: "john@example.com",
        patient_uuid: "p-1",
        gender: "Male",
        dob: "1990-01-01",
        dob_is_estimated: false,
        age: 36,
        has_synced_to_openmrs: false,
        is_active: true,
        visit_status: "active",
        created_at: "2026-09-01T08:00:00Z",
        updated_at: "2026-09-01T08:00:00Z",
        created_by: 1,
      },
    ];

    render(<OverviewRecentClients clients={clients} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("MRN-101")).toBeInTheDocument();
  });

  it("renders clinical workstations with direct links", () => {
    render(<OverviewWorkstations />);

    expect(screen.getByText("Active Visits Queue")).toBeInTheDocument();
    expect(screen.getByText("Appointments Calendar")).toBeInTheDocument();
    expect(screen.getByText("Pharmacy Dispensing")).toBeInTheDocument();
    expect(screen.getByText("Insurance Claims Engine")).toBeInTheDocument();
    expect(screen.getByText("Client Directory")).toBeInTheDocument();
  });
});
