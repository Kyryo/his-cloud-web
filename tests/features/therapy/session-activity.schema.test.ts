import { describe, expect, it } from "vitest";

import { sessionActivitySchema } from "@/features/therapy/schemas/session-activity.schema";

const VALID_ACTIVITY = {
  session_uuid: "12345678-1234-4678-9234-567812345678",
  name: "Balance training",
  category: "Mobility",
  description: "Supported standing balance practice.",
  instructions: "Stand with support for thirty seconds.",
  precautions: "",
  sets: null,
  reps: null,
  duration_seconds: null,
  resistance_or_level: "",
  cues_provided: "",
  performance_notes: "minimal_assistance",
  is_home_program: false,
};

describe("session activity schema", () => {
  it("requires a selected therapy session", () => {
    const result = sessionActivitySchema.safeParse({
      ...VALID_ACTIVITY,
      session_uuid: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a session selection and performance option", () => {
    const result = sessionActivitySchema.safeParse(VALID_ACTIVITY);

    expect(result.success).toBe(true);
  });
});
