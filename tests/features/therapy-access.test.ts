import { describe, expect, it } from "vitest";

import {
  canAccessTherapyDiscipline,
  isTherapyDiscipline,
} from "@/features/therapy/utils/therapy-access";

describe("therapy access", () => {
  it("allows only the group assigned to a discipline", () => {
    expect(canAccessTherapyDiscipline(["Speech"], "speech")).toBe(true);
    expect(canAccessTherapyDiscipline(["Speech"], "physio")).toBe(false);
    expect(canAccessTherapyDiscipline(["Physio"], "physio")).toBe(true);
    expect(canAccessTherapyDiscipline(["Occupational"], "occupational")).toBe(
      true,
    );
  });

  it("recognizes supported therapy route segments", () => {
    expect(isTherapyDiscipline("speech")).toBe(true);
    expect(isTherapyDiscipline("physio")).toBe(true);
    expect(isTherapyDiscipline("occupational")).toBe(true);
    expect(isTherapyDiscipline("dental")).toBe(false);
  });
});
