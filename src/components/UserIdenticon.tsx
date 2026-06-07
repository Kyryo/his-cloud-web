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
  className,
  fallbackClassName,
}: UserIdenticonProps) {
  const avatarSrc = useMemo(() => createIdenticonDataUri(seed), [seed]);

  return (
    <Avatar className={cn("size-8 rounded-lg", className)}>
      <AvatarImage src={avatarSrc} alt={name} />
      <AvatarFallback className={cn("rounded-lg text-xs", fallbackClassName)}>
        {getInitials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
