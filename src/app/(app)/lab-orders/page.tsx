import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabOrdersListPage } from "@/features/laboratory/pages/LabOrdersListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading laboratory orders..." />}>
      <LabOrdersListPage />
    </Suspense>
  );
}
