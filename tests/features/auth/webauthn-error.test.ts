import { describe, expect, it } from "vitest";

import { webAuthnErrorMessage } from "@/features/auth/utils/webauthn";

describe("webAuthnErrorMessage", () => {
  it("does not leak internals for a cancelled ceremony", () => {
    expect(
      webAuthnErrorMessage(new DOMException("The operation was aborted.", "NotAllowedError")),
    ).toBe("Security key verification was cancelled or timed out.");
  });

  it("explains a key that is already registered", () => {
    expect(
      webAuthnErrorMessage(
        new DOMException("The authenticator was previously registered.", "InvalidStateError"),
      ),
    ).toBe("This security key is already registered.");
  });
});
