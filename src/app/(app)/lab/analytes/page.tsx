import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabAnalytesListPage } from "@/features/laboratory/pages/LabAnalytesListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading analytes..." />}>
      <LabAnalytesListPage />
    </Suspense>
  );
}
