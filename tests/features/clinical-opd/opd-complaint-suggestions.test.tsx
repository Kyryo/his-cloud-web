import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdComplaintComposer } from "@/features/clinical-opd/components/detail/OpdComplaintComposer";

vi.mock("@/features/clinical-opd/hooks/use-clinical-opd", () => ({
  useCreateChiefComplaint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateChiefComplaint: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSaveChiefComplaintHpi: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useChiefComplaintSuggestions: () => ({
    data: [
      { text: "Cough", last_recorded_at: "2026-01-01", occurrence_count: 2 },
      { text: "Fever", last_recorded_at: "2026-01-02", occurrence_count: 1 },
      { text: "Headache", last_recorded_at: "2026-01-03", occurrence_count: 3 },
      { text: "Chest pain", last_recorded_at: "2026-01-04", occurrence_count: 1 },
      { text: "Abdominal pain", last_recorded_at: "2026-01-05", occurrence_count: 1 },
    ],
    isLoading: false,
  }),
}));

afterEach(() => {
  cleanup();
});

describe("OpdComplaintComposer past complaints", () => {
  it("shows at most three suggestions and opens a searchable dialog on view more", () => {
    render(
      <OpdComplaintComposer
        visitUuid="visit-1"
        encounterUuid="enc-1"
        canWriteComplaint
        canWriteHpi
      />,
    );

    const chips = screen.getByTestId("opd-complaint-suggestions");
    expect(chips.querySelectorAll("button")).toHaveLength(4); // 3 chips + view more
    expect(screen.getByText("Cough")).toBeInTheDocument();
    expect(screen.getByText("Fever")).toBeInTheDocument();
    expect(screen.getByText("Headache")).toBeInTheDocument();
    expect(screen.queryByText("Chest pain")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Comment")).toBeInTheDocument();
    expect(
      screen.queryByText("History of present illness"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("opd-complaint-suggestions-view-more"));
    expect(screen.getByTestId("opd-past-complaints-dialog")).toBeInTheDocument();
    expect(screen.getByText("Chest pain")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("opd-past-complaints-search"), {
      target: { value: "chest" },
    });
    expect(screen.getByText("Chest pain")).toBeInTheDocument();
    expect(screen.queryByText("Abdominal pain")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Chest pain"));
    expect(screen.getByDisplayValue("Chest pain")).toBeInTheDocument();
  });
});
