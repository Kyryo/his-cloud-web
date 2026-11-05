import Image from "next/image";

import { BRAND_LOGO_SRC } from "@/constants/brand";
import { cn } from "@/lib/utils";

type BlogCoverImageProps = {
  src?: string | null;
  alt?: string | null;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Blog covers often point at Django `/media/**` on another origin/port.
 * Next's optimizer rejects many of those URLs (`url parameter is not allowed`),
 * so absolute http(s) sources render with `unoptimized` (or a plain img fallback).
 */
export function BlogCoverImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: BlogCoverImageProps) {
  const url = src?.trim() || "";
  const absolute = url ? isAbsoluteHttpUrl(url) : false;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[color:var(--landing-warm)]",
        className,
      )}
    >
      {url && absolute ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote media bypasses broken optimizer allowlist
        <img
          src={url}
          alt={alt?.trim() || ""}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : url ? (
        <Image
          src={url}
          alt={alt?.trim() || ""}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <Image
            src={BRAND_LOGO_SRC}
            alt=""
            width={48}
            height={48}
            className="opacity-30"
          />
        </span>
      )}
    </div>
  );
}
