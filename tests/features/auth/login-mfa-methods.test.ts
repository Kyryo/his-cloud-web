import { describe, expect, it } from "vitest";

import { hasAlternateMfaMethods } from "@/features/auth/components/LoginMfaMethodPicker";

describe("hasAlternateMfaMethods", () => {
  it("is hidden when only email is available", () => {
    expect(hasAlternateMfaMethods(["email"])).toBe(false);
  });

  it("is shown when totp is enrolled", () => {
    expect(hasAlternateMfaMethods(["email", "totp"])).toBe(true);
  });

  it("is shown for webauthn or recovery codes", () => {
    expect(hasAlternateMfaMethods(["email", "webauthn"])).toBe(true);
    expect(hasAlternateMfaMethods(["email", "recovery_codes"])).toBe(true);
  });
});
