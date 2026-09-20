import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabTestsListPage } from "@/features/laboratory/pages/LabTestsListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading laboratory tests..." />}>
      <LabTestsListPage />
    </Suspense>
  );
}
