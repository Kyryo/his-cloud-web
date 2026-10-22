import { describe, expect, it } from "vitest";

import { resolveQuickAccessCards } from "@/features/overview/utils/overview-start";

describe("overview quick access helpers", () => {
  it("maps API quick-access cards onto labeled action cards", () => {
    const cards = resolveQuickAccessCards(
      [
        { area_key: "/customers", label: "Clients", is_primary: true },
        { area_key: "/sales-orders", label: "Sales orders", is_primary: false },
      ],
      ["Registration", "Billing"],
      ["Registration", "Billing"],
    );

    expect(cards).toHaveLength(2);
    expect(cards[0]?.isPrimary).toBe(true);
    expect(cards[0]?.pageName).toBe("Clients");
    expect(cards[0]?.href).toBe("/customers");
    expect(cards[1]?.isPrimary).toBe(false);
  });
});
