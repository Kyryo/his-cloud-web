import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { OhEmployeesListPage } from "@/features/occupational-health/pages/OhEmployeesListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading employees..." />}>
      <OhEmployeesListPage />
    </Suspense>
  );
}
