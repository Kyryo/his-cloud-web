import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { OpdQueuePage } from "@/features/clinical-opd/pages/OpdQueuePage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading OPD queue..." />}>
      <OpdQueuePage />
    </Suspense>
  );
}
