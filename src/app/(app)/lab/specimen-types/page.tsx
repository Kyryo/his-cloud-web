import { Suspense } from "react";

import { PageLoader } from "@/components/page-loader";
import { LabSpecimenTypesListPage } from "@/features/laboratory/pages/LabSpecimenTypesListPage";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader message="Loading specimen types..." />}>
      <LabSpecimenTypesListPage />
    </Suspense>
  );
}
