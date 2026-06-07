import { describe, expect, it } from "vitest";

import { maskEmail } from "@/lib/mask-email";

describe("maskEmail", () => {
  it("masks the local part and domain labels", () => {
    expect(maskEmail("hello@example.com")).toBe("h***@e***.com");
    expect(maskEmail("User@Example.com")).toBe("u***@e***.com");
  });

  it("masks each domain label before the tld", () => {
    expect(maskEmail("user@mail.example.com")).toBe("u***@m***.e***.com");
  });

  it("returns the original value when no local part exists", () => {
    expect(maskEmail("@example.com")).toBe("@example.com");
  });
});
