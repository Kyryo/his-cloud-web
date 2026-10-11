import {
  ListPageDataTable,
  ListPageDataTableBody,
} from "@/features/app-shell/components/page-layout";
import { BlogPostsTableHead } from "@/features/platform-admin/components/blog/BlogPostsTableColumns";
import { BlogPostsTableRow } from "@/features/platform-admin/components/blog/BlogPostsTableRow";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";

type BlogPostsTableProps = {
  posts: BlogPost[];
  onDelete: (post: BlogPost) => void;
};

export function BlogPostsTable({ posts, onDelete }: BlogPostsTableProps) {
  return (
    <ListPageDataTable>
      <BlogPostsTableHead />
      <ListPageDataTableBody>
        {posts.map((post) => (
          <BlogPostsTableRow key={post.id} post={post} onDelete={onDelete} />
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
