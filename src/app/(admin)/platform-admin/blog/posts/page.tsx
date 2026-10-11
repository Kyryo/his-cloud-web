import { Suspense } from "react";

import { BlogPostsPageSkeleton } from "@/features/platform-admin/components/blog/BlogPostsPageSkeleton";
import { PlatformAdminBlogPostsPage } from "@/features/platform-admin/pages/PlatformAdminBlogPostsPage";

export default function Page() {
  return (
    <Suspense fallback={<BlogPostsPageSkeleton />}>
      <PlatformAdminBlogPostsPage />
    </Suspense>
  );
}
