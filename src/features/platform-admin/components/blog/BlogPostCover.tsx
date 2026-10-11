import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type BlogPostCoverProps = {
  src?: string | null;
  alt?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Cover thumbnail. Remote CMS URLs are not in next/image remotePatterns, so it renders unoptimized. */
export function BlogPostCover({ src, alt, className, sizes = "96px", priority = false }: BlogPostCoverProps) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-dash-canvas", className)}>
      {src ? (
        <Image src={src} alt={alt ?? ""} fill sizes={sizes} unoptimized priority={priority} className="object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-dash-muted/70">
          <ImageIcon className="size-4" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
