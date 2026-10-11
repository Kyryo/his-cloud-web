"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { BlogFormSection, BlogFormSheetLayout } from "@/features/platform-admin/components/blog/BlogFormSheetLayout";
import { BlogPostBasicsFields } from "@/features/platform-admin/components/blog/BlogPostBasicsFields";
import { BlogPostCoverFields } from "@/features/platform-admin/components/blog/BlogPostCoverFields";
import { BlogPostTaxonomyFields } from "@/features/platform-admin/components/blog/BlogPostTaxonomyFields";
import { useSaveBlogPost } from "@/features/platform-admin/hooks/use-blog-cms";
import {
  EMPTY_BLOG_POST_BASICS,
  basicsToCreateInput,
  blogPostBasicsSchema,
  type BlogPostBasicsValues,
} from "@/features/platform-admin/schemas/blog-post.schema";
import { applyBlogSaveError } from "@/features/platform-admin/utils/blog-save-error";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "blog-post-create-form";

type BlogPostCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BlogPostCreateSheet({ open, onOpenChange }: BlogPostCreateSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const savePost = useSaveBlogPost();
  const form = useForm<BlogPostBasicsValues>({
    resolver: zodResolver(blogPostBasicsSchema),
    defaultValues: EMPTY_BLOG_POST_BASICS,
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(EMPTY_BLOG_POST_BASICS);
    }
    onOpenChange(next);
  }

  async function handleSubmit(values: BlogPostBasicsValues) {
    try {
      const created = await savePost.mutateAsync({ postId: "new", input: basicsToCreateInput(values) });
      toast({ variant: "success", title: "Draft created", description: "Now add the content." });
      form.reset(EMPTY_BLOG_POST_BASICS);
      router.push(ROUTES.platformAdminBlogPost(created.id));
    } catch (error) {
      const message = applyBlogSaveError(error, form.setError);
      if (message) {
        toast({ variant: "error", title: "Could not create the post", description: message });
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg" data-testid="blog-post-create-sheet">
        <BlogFormSheetLayout
          title="New post"
          description="Start with the basics. You will write the content on the next screen."
          footer={
            <>
              <SecondaryButton type="button" onClick={() => handleOpenChange(false)} disabled={savePost.isPending}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" form={FORM_ID} disabled={savePost.isPending}>
                {savePost.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                Create draft
              </PrimaryButton>
            </>
          }
        >
          <Form {...form}>
            <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
              <BlogFormSection title="Basics">
                <BlogPostBasicsFields autoSlug />
              </BlogFormSection>
              <BlogFormSection title="Organisation">
                <BlogPostTaxonomyFields />
              </BlogFormSection>
              <BlogFormSection title="Cover">
                <BlogPostCoverFields />
              </BlogFormSection>
            </form>
          </Form>
        </BlogFormSheetLayout>
      </SheetContent>
    </Sheet>
  );
}
