import { cn } from "@/lib/utils";

type WorkspaceAvatarProps = {
  name: string;
  className?: string;
};

const WORKSPACE_AVATAR_TONES = [
  { bg: "bg-brand-primary", text: "text-white" },
  { bg: "bg-brand-sky", text: "text-white" },
  { bg: "bg-brand-amber", text: "text-white" },
  { bg: "bg-brand-navy", text: "text-white" },
  { bg: "bg-brand-slate", text: "text-white" },
] as const;

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

export function getWorkspaceAvatarTone(name: string) {
  const source = name.trim() || "?";
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }
  return WORKSPACE_AVATAR_TONES[Math.abs(hash) % WORKSPACE_AVATAR_TONES.length];
}

export function WorkspaceAvatar({ name, className }: WorkspaceAvatarProps) {
  const initials = getWorkspaceInitials(name);
  const tone = getWorkspaceAvatarTone(name);

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide",
        tone.bg,
        tone.text,
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
