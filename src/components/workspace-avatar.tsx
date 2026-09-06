"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type WorkspaceAvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

export function getWorkspaceInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const parts =
    words.length >= 2
      ? words
      : (words[0]?.split(/[-_]/).filter(Boolean) ?? []);

  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export function WorkspaceAvatar({
  name,
  src,
  className,
}: WorkspaceAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getWorkspaceInitials(name);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-primary text-[11px] font-semibold tracking-wide text-white",
        className,
      )}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
