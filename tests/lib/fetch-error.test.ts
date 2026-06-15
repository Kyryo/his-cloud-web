import { describe, expect, it, vi } from "vitest";

import { getErrorMessage, logFetchError } from "@/lib/fetch-error";

describe("fetch error helpers", () => {
  it("returns the error message when available", () => {
    expect(getErrorMessage(new Error("Network failed"))).toBe("Network failed");
  });

  it("falls back when the error is not an Error instance", () => {
    expect(getErrorMessage(undefined, "Could not load data.")).toBe(
      "Could not load data.",
    );
  });

  it("logs fetch errors with context", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Timeout");

    logFetchError("TestContext", error);

    expect(errorSpy).toHaveBeenCalledWith("[TestContext]", error);
    errorSpy.mockRestore();
  });
});
