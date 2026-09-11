import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { AppointmentsListPage } from "@/features/appointments/pages/AppointmentsListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading appointments..." />}>
      <AppointmentsListPage />
    </Suspense>
  );
}
