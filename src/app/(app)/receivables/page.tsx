import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { ReceivablesPage } from "@/features/receivables/pages/ReceivablesPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading receivables..." />}>
      <ReceivablesPage />
    </Suspense>
  );
}
