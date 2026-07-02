import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { MasmEclaimsSettingsPage } from "@/features/settings/pages/MasmEclaimsSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MasmEclaimsSettingsPage />
    </Suspense>
  );
}
