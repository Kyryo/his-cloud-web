import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { DentalQueuePage } from "@/features/clinical-dental/pages/DentalQueuePage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading dental queue..." />}>
      <DentalQueuePage />
    </Suspense>
  );
}
