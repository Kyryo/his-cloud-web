import { Suspense } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { MasmEclaimsSettingsPage } from "@/features/settings/pages/MasmEclaimsSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<SettingsContentSkeleton />}>
      <MasmEclaimsSettingsPage />
    </Suspense>
  );
}
