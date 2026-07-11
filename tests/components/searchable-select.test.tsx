import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";

describe("SearchableSelect", () => {
  it("focuses the search input when the select opens", async () => {
    render(
      <SearchableSelect
        open
        onOpenChange={vi.fn()}
        onValueChange={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
        placeholder="Select a client"
      >
        <SelectItem value="one">One</SelectItem>
      </SearchableSelect>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search...")).toHaveFocus();
    });
  });
});
