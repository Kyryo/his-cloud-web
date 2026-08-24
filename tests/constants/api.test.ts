import { describe, expect, it } from "vitest";

import { resolveHmisApiUrl } from "@/constants/api";

describe("resolveHmisApiUrl", () => {
  it("appends /api/v1 when only a host is configured", () => {
    expect(resolveHmisApiUrl("https://api.example.com")).toBe(
      "https://api.example.com/api/v1",
    );
    expect(resolveHmisApiUrl("http://localhost:8000/")).toBe(
      "http://localhost:8000/api/v1",
    );
  });

  it("keeps an explicit v1 path", () => {
    expect(resolveHmisApiUrl("http://localhost:8000/api/v1")).toBe(
      "http://localhost:8000/api/v1",
    );
    expect(resolveHmisApiUrl("https://api.example.com/api/v1/")).toBe(
      "https://api.example.com/api/v1",
    );
  });

  it("does not rewrite a custom path", () => {
    expect(resolveHmisApiUrl("https://gateway.example.com/hmis")).toBe(
      "https://gateway.example.com/hmis",
    );
  });
});
