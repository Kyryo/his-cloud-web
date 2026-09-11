import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { SalesOrdersListPage } from "@/features/sales-orders/pages/SalesOrdersListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading sales orders..." />}>
      <SalesOrdersListPage />
    </Suspense>
  );
}
