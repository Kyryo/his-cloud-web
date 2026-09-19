import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabReferenceRangesListPage } from "@/features/laboratory/pages/LabReferenceRangesListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading reference ranges..." />}>
      <LabReferenceRangesListPage />
    </Suspense>
  );
}
