"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BlogImageUrlField } from "@/features/platform-admin/components/blog/BlogImageUrlField";
import type { BlogPostDetailsValues } from "@/features/platform-admin/schemas/blog-post.schema";

export function BlogPostSeoFields() {
  const form = useFormContext<BlogPostDetailsValues>();
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="seoTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SEO title</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Defaults to the post title" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="seoDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SEO description</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} placeholder="Defaults to the excerpt" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="socialImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Social image</FormLabel>
            <BlogImageUrlField value={field.value} onChange={field.onChange} folder="social" />
            <FormDescription>Shown when the post is shared. Defaults to the cover image.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="canonicalUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Canonical URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://…" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="noindex"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-4 space-y-0">
            <div>
              <FormLabel>Hide from search engines</FormLabel>
              <FormDescription>Adds a noindex tag to the public page.</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
