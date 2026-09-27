"use client";

import { useMemo } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { createIdenticonDataUri } from "@/lib/dicebear-identicon";
import { cn } from "@/lib/utils";

type UserIdenticonProps = {
  seed: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserIdenticon({
  seed,
  name,
  imageUrl,
  className,
  fallbackClassName,
}: UserIdenticonProps) {
  const identiconSrc = useMemo(() => createIdenticonDataUri(seed), [seed]);
  const avatarSrc = imageUrl?.trim() || identiconSrc;

  return (
    <Avatar className={cn("size-8 rounded-lg", className)}>
      <AvatarImage
        src={avatarSrc}
        alt={name}
        className={imageUrl?.trim() ? "object-cover" : undefined}
      />
      <AvatarFallback className={cn("rounded-lg text-xs", fallbackClassName)}>
        {getInitials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
