"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPostBasicsValues } from "@/features/platform-admin/schemas/blog-post.schema";
import { slugifyBlogTitle } from "@/features/platform-admin/utils/blog-format";

type BlogPostBasicsFieldsProps = {
  /** Keep the slug in step with the title until the slug is edited by hand. */
  autoSlug: boolean;
};

export function BlogPostBasicsFields({ autoSlug }: BlogPostBasicsFieldsProps) {
  const form = useFormContext<BlogPostBasicsValues>();
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                {...field}
                autoFocus
                placeholder="What is this post about?"
                onChange={(event) => {
                  field.onChange(event);
                  if (autoSlug && !form.getFieldState("slug").isDirty) {
                    form.setValue("slug", slugifyBlogTitle(event.target.value), { shouldValidate: form.formState.isSubmitted });
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="pl-3 text-sm text-dash-muted">/</span>
                <input
                  {...field}
                  className="h-10 w-full bg-transparent pl-1 pr-3 text-sm outline-none"
                  onChange={(event) => field.onChange(slugifyBlogTitle(event.target.value))}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="excerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} placeholder="One or two sentences shown in post lists and previews." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
