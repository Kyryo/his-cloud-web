import { describe, expect, it } from "vitest";

import { nursingNoteSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

describe("clinical-opd schemas", () => {
  it("requires nursing note body", () => {
    const result = nursingNoteSchema.safeParse({ body: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid nursing note body", () => {
    const result = nursingNoteSchema.safeParse({ body: "Patient stable." });
    expect(result.success).toBe(true);
  });
});
