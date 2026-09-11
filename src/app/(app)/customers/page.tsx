import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { CustomersListPage } from "@/features/customers/pages/CustomersListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading clients..." />}>
      <CustomersListPage />
    </Suspense>
  );
}
