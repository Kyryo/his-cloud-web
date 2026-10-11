"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListPageSearchField } from "@/features/app-shell/components/page-layout";
import type { BlogCategory } from "@/features/platform-admin/types/blog.types";
import {
  BLOG_POST_SORTS,
  type BlogPostListQuery,
  type BlogPostSort,
} from "@/features/platform-admin/utils/blog-post-list";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ value: BlogPostListQuery["status"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

const SELECT_TRIGGER_CLASS = "h-8 w-full rounded-lg border-dash-border bg-white text-[13px] sm:w-44";

type BlogPostsToolbarProps = {
  query: BlogPostListQuery;
  categories: BlogCategory[];
  onChange: (patch: Partial<BlogPostListQuery>) => void;
};

export function BlogPostsToolbar({ query, categories, onChange }: BlogPostsToolbarProps) {
  const [search, setSearch] = useState(query.search);
  const [syncedSearch, setSyncedSearch] = useState(query.search);
  if (query.search !== syncedSearch) {
    setSyncedSearch(query.search);
    setSearch(query.search);
  }

  return (
    <div className="space-y-3">
      <nav aria-label="Filter by status" className="flex gap-5 border-b border-dash-border/80">
        {STATUS_TABS.map((tab) => {
          const active = query.status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onChange({ status: tab.value })}
              className={cn(
                "-mb-px border-b-2 pb-2 text-[13px] font-medium transition-colors",
                active
                  ? "border-brand-primary text-brand-navy"
                  : "border-transparent text-dash-muted hover:text-brand-navy",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <ListPageSearchField
            value={search}
            placeholder="Search title, slug or text, then press Enter"
            onChange={(value) => {
              setSearch(value);
              if (value === "") {
                onChange({ search: "" });
              }
            }}
            onSubmit={() => onChange({ search: search.trim() })}
            data-testid="blog-posts-search"
          />
        </div>
        <Select value={query.categoryId} onValueChange={(value) => onChange({ categoryId: value })}>
          <SelectTrigger className={SELECT_TRIGGER_CLASS} aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={query.sort} onValueChange={(value) => onChange({ sort: value as BlogPostSort })}>
          <SelectTrigger className={SELECT_TRIGGER_CLASS} aria-label="Sort posts">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOG_POST_SORTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
