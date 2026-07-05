import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ClientAvatarProps = {
  name: string;
  className?: string;
};

type AvatarTone = {
  fallback: string;
  border: string;
};

const AVATAR_TONES: AvatarTone[] = [
  {
    fallback: "bg-brand-tint text-brand-primary",
    border: "border-brand-primary/30",
  },
  {
    fallback: "bg-slate-100 text-brand-slate",
    border: "border-slate-300",
  },
  {
    fallback: "bg-sky-50 text-brand-sky",
    border: "border-sky-200",
  },
  {
    fallback: "bg-indigo-50 text-indigo-700",
    border: "border-indigo-200",
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarTone(name: string): AvatarTone {
  const hash = name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

export function ClientAvatar({ name, className }: ClientAvatarProps) {
  const initials = getInitials(name) || "?";
  const tone = getAvatarTone(name);

  return (
    <Avatar className={cn("size-9 shrink-0", className)}>
      <AvatarFallback
        className={cn(
          "border text-xs font-medium",
          tone.fallback,
          tone.border,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
