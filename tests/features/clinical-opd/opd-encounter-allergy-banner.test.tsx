import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OpdEncounterAllergyBanner } from "@/features/clinical-opd/components/detail/OpdEncounterAllergyBanner";

vi.mock(
  "@/features/clinical-opd/components/detail/opd-encounter-workspace-context",
  () => ({
    useOpdEncounterWorkspace: () => ({
      visitUuid: "visit-1",
      encounterUuid: "enc-1",
      visibleTabIds: ["overview", "allergies"],
    }),
  }),
);

afterEach(() => {
  cleanup();
});

describe("OpdEncounterAllergyBanner", () => {
  it("renders high-risk allergies from chart-summary", () => {
    render(
      <OpdEncounterAllergyBanner
        allergies={[
          {
            uuid: "alg-1",
            allergy_name: "Penicillin",
            allergy_type: "medication",
            severity: "life_threatening",
            reaction: "Anaphylaxis",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("opd-encounter-allergy-banner")).toBeInTheDocument();
    expect(screen.getByText("High-risk allergies on file")).toBeInTheDocument();
    expect(screen.getByText(/Penicillin \(life_threatening\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review allergies" })).toHaveAttribute(
      "href",
      "/clinical/opd/visit-1/enc-1/allergies",
    );
  });
});
