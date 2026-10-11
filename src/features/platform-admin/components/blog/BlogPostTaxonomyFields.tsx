"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlogChipToggleGroup } from "@/features/platform-admin/components/blog/BlogChipToggleGroup";
import { useBlogAuthors, useBlogCategories, useBlogTags } from "@/features/platform-admin/hooks/use-blog-cms";
import type { BlogPostBasicsValues } from "@/features/platform-admin/schemas/blog-post.schema";

const NO_AUTHOR = "none";

export function BlogPostTaxonomyFields() {
  const form = useFormContext<BlogPostBasicsValues>();
  const authors = useBlogAuthors().data?.results ?? [];
  const categories = (useBlogCategories().data?.results ?? []).map((category) => ({ id: category.id, label: category.title }));
  const tags = (useBlogTags().data?.results ?? []).map((tag) => ({ id: tag.id, label: tag.title }));

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="authorId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Author</FormLabel>
            <Select value={field.value || NO_AUTHOR} onValueChange={(value) => field.onChange(value === NO_AUTHOR ? "" : value)}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="No author" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NO_AUTHOR}>No author</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="categoryIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categories</FormLabel>
            <BlogChipToggleGroup
              ariaLabel="Categories"
              options={categories}
              value={field.value}
              onChange={field.onChange}
              emptyMessage="No categories yet. Add them under Blog → Categories."
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tagIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <BlogChipToggleGroup
              ariaLabel="Tags"
              options={tags}
              value={field.value}
              onChange={field.onChange}
              emptyMessage="No tags yet. Add them under Blog → Tags."
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
