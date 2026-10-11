import {
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
} from "@/features/app-shell/components/page-layout";
import { BlogSampleDataTag } from "@/features/platform-admin/components/blog/BlogSampleDataTag";

/** Responsive visibility shared by header, rows and skeleton so they always line up. */
export const BLOG_POSTS_COLUMN_CLASS = {
  post: "w-full min-w-[18rem]",
  author: "hidden lg:table-cell",
  category: "hidden xl:table-cell",
  status: "",
  date: "hidden md:table-cell whitespace-nowrap",
  views: "hidden sm:table-cell text-right",
  actions: "w-10 text-right",
} as const;

export function BlogPostsTableHead() {
  return (
    <ListPageDataTableHeader>
      <ListPageDataTableHeaderRow className="bg-transparent">
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.post}>Post</ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.author}>Author</ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.category}>Category</ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.status}>Status</ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.date}>Date</ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.views}>
          <span className="inline-flex items-center gap-1.5">Views <BlogSampleDataTag /></span>
        </ListPageDataTableHeaderCell>
        <ListPageDataTableHeaderCell className={BLOG_POSTS_COLUMN_CLASS.actions}>
          <span className="sr-only">Actions</span>
        </ListPageDataTableHeaderCell>
      </ListPageDataTableHeaderRow>
    </ListPageDataTableHeader>
  );
}
