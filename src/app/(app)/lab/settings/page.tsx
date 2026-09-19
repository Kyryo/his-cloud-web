import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabSettingsPage } from "@/features/laboratory/pages/LabSettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading laboratory settings..." />}>
      <LabSettingsPage />
    </Suspense>
  );
}
