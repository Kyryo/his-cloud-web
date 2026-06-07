import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ClientAvatarProps = {
  name: string;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getToneClass(name: string): string {
  const tones = [
    "bg-brand-tint text-brand-primary",
    "bg-slate-100 text-brand-slate",
    "bg-sky-50 text-brand-sky",
    "bg-indigo-50 text-indigo-700",
  ];
  const hash = name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return tones[hash % tones.length] ?? tones[0];
}

export function ClientAvatar({ name, className }: ClientAvatarProps) {
  const initials = getInitials(name) || "?";

  return (
    <Avatar className={cn("size-9 shrink-0", className)}>
      <AvatarFallback
        className={cn("text-xs font-medium", getToneClass(name))}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
