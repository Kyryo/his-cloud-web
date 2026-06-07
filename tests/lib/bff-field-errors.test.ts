import { describe, expect, it } from "vitest";

import {
  formatBffErrorMessage,
  getFieldError,
  getFirstErrorMessage,
  mapBffErrorsToForm,
} from "@/lib/bff-field-errors";

describe("bff-field-errors", () => {
  const errors = [
    { code: "required", field: "first_name", message: "First name is required." },
    { code: "required", field: "last_name", message: "Last name is required." },
  ];

  it("gets a field-specific error", () => {
    expect(getFieldError(errors, "first_name")).toBe("First name is required.");
    expect(getFieldError(errors, "email")).toBeUndefined();
  });

  it("gets the first error message", () => {
    expect(getFirstErrorMessage(errors)).toBe("First name is required.");
  });

  it("maps errors to form fields", () => {
    expect(mapBffErrorsToForm(errors)).toEqual({
      first_name: "First name is required.",
      last_name: "Last name is required.",
    });
  });

  it("formats combined error messages", () => {
    expect(formatBffErrorMessage("Request failed.", errors)).toBe(
      "First name is required. Last name is required.",
    );
  });
});
