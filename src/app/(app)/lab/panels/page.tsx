import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabPanelsListPage } from "@/features/laboratory/pages/LabPanelsListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading laboratory panels..." />}>
      <LabPanelsListPage />
    </Suspense>
  );
}
