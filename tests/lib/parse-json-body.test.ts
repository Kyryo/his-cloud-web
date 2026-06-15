import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseJsonBody } from "@/lib/server/parse-json-body";

describe("parseJsonBody", () => {
  it("returns parsed data for valid JSON and schema", async () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const result = await parseJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "Acme" }),
      }),
      schema,
    );

    expect("data" in result).toBe(true);
    if ("data" in result) {
      expect(result.data.name).toBe("Acme");
    }
  });

  it("returns a validation error response for invalid payloads", async () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const result = await parseJsonBody(
      new Request("http://localhost/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      }),
      schema,
    );

    expect("error" in result).toBe(true);
  });
});
