"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BlogFormSection, BlogFormSheetLayout } from "@/features/platform-admin/components/blog/BlogFormSheetLayout";
import { BlogPostBasicsFields } from "@/features/platform-admin/components/blog/BlogPostBasicsFields";
import { BlogPostCoverFields } from "@/features/platform-admin/components/blog/BlogPostCoverFields";
import { BlogPostPublishingFields } from "@/features/platform-admin/components/blog/BlogPostPublishingFields";
import { BlogPostSeoFields } from "@/features/platform-admin/components/blog/BlogPostSeoFields";
import { BlogPostTaxonomyFields } from "@/features/platform-admin/components/blog/BlogPostTaxonomyFields";
import { useSaveBlogPost } from "@/features/platform-admin/hooks/use-blog-cms";
import {
  blogPostDetailsSchema,
  detailsToUpdateInput,
  toBlogPostDetailsValues,
  type BlogPostDetailsValues,
} from "@/features/platform-admin/schemas/blog-post.schema";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { applyBlogSaveError } from "@/features/platform-admin/utils/blog-save-error";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "blog-post-details-form";

type BlogPostDetailsSheetProps = {
  post: BlogPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Sheet content mounts on open, so the form always starts from the latest post. */
function BlogPostDetailsForm({ post, onDone }: { post: BlogPost; onDone: () => void }) {
  const { toast } = useToast();
  const savePost = useSaveBlogPost();
  const form = useForm<BlogPostDetailsValues>({
    resolver: zodResolver(blogPostDetailsSchema),
    defaultValues: toBlogPostDetailsValues(post),
  });

  async function handleSubmit(values: BlogPostDetailsValues) {
    try {
      await savePost.mutateAsync({ postId: post.id, input: detailsToUpdateInput(post, values) });
      toast({ variant: "success", title: "Details saved" });
      onDone();
    } catch (error) {
      const message = applyBlogSaveError(error, form.setError);
      if (message) {
        toast({ variant: "error", title: "Could not save details", description: message });
      }
    }
  }

  return (
    <BlogFormSheetLayout
      title="Edit details"
      description="Title, organisation, publishing and search settings."
      footer={
        <>
          <SecondaryButton type="button" onClick={onDone} disabled={savePost.isPending}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={FORM_ID} disabled={savePost.isPending}>
            {savePost.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save details
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <BlogFormSection title="Basics">
            <BlogPostBasicsFields autoSlug={false} />
          </BlogFormSection>
          <BlogFormSection title="Publishing">
            <BlogPostPublishingFields />
          </BlogFormSection>
          <BlogFormSection title="Organisation">
            <BlogPostTaxonomyFields />
          </BlogFormSection>
          <BlogFormSection title="Cover">
            <BlogPostCoverFields />
          </BlogFormSection>
          <BlogFormSection title="Search & sharing">
            <BlogPostSeoFields />
          </BlogFormSection>
        </form>
      </Form>
    </BlogFormSheetLayout>
  );
}

export function BlogPostDetailsSheet({ post, open, onOpenChange }: BlogPostDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl" data-testid="blog-post-details-sheet">
        <BlogPostDetailsForm post={post} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
