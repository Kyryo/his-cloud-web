"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BlogImageUrlField } from "@/features/platform-admin/components/blog/BlogImageUrlField";
import type { BlogPostBasicsValues } from "@/features/platform-admin/schemas/blog-post.schema";

export function BlogPostCoverFields() {
  const form = useFormContext<BlogPostBasicsValues>();
  const alt = useWatch({ control: form.control, name: "mainImageAlt" });
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="mainImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover image</FormLabel>
            <BlogImageUrlField value={field.value} onChange={field.onChange} folder="covers" alt={alt} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="mainImageAlt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover alt text</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Describe the image for screen readers" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
