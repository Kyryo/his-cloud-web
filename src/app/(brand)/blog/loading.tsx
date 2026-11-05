import { BlogListingSkeleton } from "@/features/brand/blog/components/BlogListingSkeleton";

export default function Loading() {
  return (
    <div className="bg-white pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <BlogListingSkeleton />
      </div>
    </div>
  );
}
