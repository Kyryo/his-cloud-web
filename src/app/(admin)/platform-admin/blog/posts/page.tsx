import { Suspense } from "react";

import { PlatformAdminBlogPostsPage } from "@/features/platform-admin/pages/PlatformAdminBlogPostsPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-brand-muted">Loading…</div>}>
      <PlatformAdminBlogPostsPage />
    </Suspense>
  );
}
