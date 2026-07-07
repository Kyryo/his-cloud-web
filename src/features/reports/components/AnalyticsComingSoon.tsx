import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function AnalyticsComingSoon() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-brand-navy">Analytics coming soon</h2>
      <p className="mt-2 max-w-md text-sm text-brand-muted">
        Deeper analytics dashboards are planned for a future release. Use Overview
        for operational charts and Reports for CSV exports in the meantime.
      </p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.reportsOverview}>Back to Overview</Link>
      </Button>
    </div>
  );
}
