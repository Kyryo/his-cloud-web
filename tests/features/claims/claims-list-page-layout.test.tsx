import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClaimsEmptyState } from "@/features/claims/components/ClaimsEmptyState";
import { ClaimsPageHeader } from "@/features/claims/components/ClaimsPageHeader";
import { RejectionsEmptyState } from "@/features/claims/components/RejectionsEmptyState";
import { RejectionsPageHeader } from "@/features/claims/components/RejectionsPageHeader";
import { RemittancesEmptyState } from "@/features/claims/components/RemittancesEmptyState";
import { RemittancesPageHeader } from "@/features/claims/components/RemittancesPageHeader";
import { DEFAULT_CLAIM_LIST_FILTERS } from "@/features/claims/utils/claim-list-filters";
import { DEFAULT_REJECTION_LIST_FILTERS } from "@/features/claims/utils/rejection-list-filters";
import { DEFAULT_REMITTANCE_LIST_FILTERS } from "@/features/claims/utils/remittance-list-filters";

afterEach(() => {
  cleanup();
});

describe("claims list page chrome", () => {
  it("puts claim search in the page header", () => {
    render(
      <ClaimsPageHeader
        search=""
        filters={DEFAULT_CLAIM_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    expect(screen.getByTestId("claims-search")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Submissions" })).not.toBeInTheDocument();
  });

  it("puts remittance search and upload in the page header", () => {
    render(
      <RemittancesPageHeader
        search=""
        filters={DEFAULT_REMITTANCE_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
        onUploadClick={vi.fn()}
      />,
    );

    expect(screen.getByTestId("remittances-search")).toBeInTheDocument();
    expect(screen.getByTestId("remittance-upload-open")).toHaveTextContent(
      "Upload remittance",
    );
    expect(screen.queryByRole("heading", { name: "Remittances" })).not.toBeInTheDocument();
  });

  it("puts rejection search in the page header", () => {
    render(
      <RejectionsPageHeader
        search=""
        filters={DEFAULT_REJECTION_LIST_FILTERS}
        onSearchChange={vi.fn()}
        onSearchSubmit={vi.fn()}
        onClearSearch={vi.fn()}
        onFiltersApply={vi.fn()}
      />,
    );

    expect(screen.getByTestId("rejections-search")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Rejections" })).not.toBeInTheDocument();
  });

  it("renders empty states without card chrome", () => {
    render(<ClaimsEmptyState />);
    render(<RemittancesEmptyState onUploadClick={vi.fn()} />);
    render(<RejectionsEmptyState />);

    expect(screen.getByTestId("claims-empty-state")).toHaveTextContent("No claims yet");
    expect(screen.getByTestId("remittances-empty-state")).toHaveTextContent(
      "No remittances yet",
    );
    expect(screen.getByTestId("rejections-empty-state")).toHaveTextContent(
      "No rejections yet",
    );
  });
});
