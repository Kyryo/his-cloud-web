import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { getPlatformBackupSections } from "@/features/platform-admin/constants/backup-service-cards";

describe("getPlatformBackupSections", () => {
  it("lists HMIS and Claims engine service cards", () => {
    const sections = getPlatformBackupSections();
    const items = sections.flatMap((section) => section.items);

    expect(items.map((item) => item.id)).toEqual(["hmis", "claims-engine"]);
    expect(items[0]?.href).toBe(ROUTES.platformAdminBackupsHmis);
    expect(items[1]?.href).toBe(ROUTES.platformAdminBackupsClaimsEngine);
  });
});
