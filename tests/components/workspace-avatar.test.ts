import { describe, expect, it } from "vitest";

import { getWorkspaceInitials } from "@/components/workspace-avatar";

describe("getWorkspaceInitials", () => {
  it("uses the first two words of a multi-word name", () => {
    expect(getWorkspaceInitials("Princeton-Plainsboro")).toBe("PP");
    expect(getWorkspaceInitials("Walk-in Clinic")).toBe("WC");
    expect(getWorkspaceInitials("Diagnostics Department")).toBe("DD");
  });

  it("uses the first two letters of a single word", () => {
    expect(getWorkspaceInitials("Sigma")).toBe("SI");
  });

  it("falls back when the name is empty", () => {
    expect(getWorkspaceInitials("   ")).toBe("?");
  });
});
