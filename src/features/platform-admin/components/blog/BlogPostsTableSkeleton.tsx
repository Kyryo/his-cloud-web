import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { BLOG_POSTS_COLUMN_CLASS, BlogPostsTableHead } from "@/features/platform-admin/components/blog/BlogPostsTableColumns";

const SKELETON_ROWS = 8;

export function BlogPostsTableSkeleton() {
  return (
    <div role="status" aria-label="Loading posts">
      <ListPageDataTable>
        <BlogPostsTableHead />
        <ListPageDataTableBody>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <ListPageDataTableRow key={index} className="hover:bg-transparent">
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.post}>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-[4.5rem]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.author}><Skeleton className="h-3.5 w-24" /></ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.category}><Skeleton className="h-3.5 w-20" /></ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.status}><Skeleton className="h-5 w-16" /></ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.date}>
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="mt-1.5 h-2.5 w-12" />
              </ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.views}><Skeleton className="ml-auto h-3.5 w-10" /></ListPageDataTableCell>
              <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.actions}><Skeleton className="ml-auto size-6" /></ListPageDataTableCell>
            </ListPageDataTableRow>
          ))}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </div>
  );
}
