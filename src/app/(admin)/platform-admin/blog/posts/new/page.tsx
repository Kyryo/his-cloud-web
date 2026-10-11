import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { BLOG_POST_LIST_PARAMS } from "@/features/platform-admin/utils/blog-post-list";

/** Old "New post" links now open the create sheet on the posts list. */
export default function Page() {
  redirect(`${ROUTES.platformAdminBlogPosts}?${BLOG_POST_LIST_PARAMS.create}=1`);
}
