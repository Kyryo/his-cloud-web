"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogPostCover } from "@/features/platform-admin/components/blog/BlogPostCover";
import { uploadBlogImage } from "@/features/platform-admin/services/blog-cms.service";
import { useToast } from "@/providers/toast-provider";

type BlogImageUrlFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  folder: "covers" | "social";
  alt?: string;
};

/** URL input with an upload button; uploads go through the existing blog uploads API. */
export function BlogImageUrlField({ id, value, onChange, folder, alt }: BlogImageUrlFieldProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const uploaded = await uploadBlogImage(file, folder);
      onChange(uploaded.url);
    } catch (error) {
      toast({
        variant: "error",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <BlogPostCover src={value} alt={alt} className="aspect-[16/9] w-full" sizes="(min-width: 640px) 28rem, 100vw" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 size-7 bg-white/90"
            aria-label="Remove image"
            onClick={() => onChange("")}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://…" />
        <Button type="button" variant="outline" className="shrink-0" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              void handleFile(file);
            }
          }}
        />
      </div>
    </div>
  );
}
