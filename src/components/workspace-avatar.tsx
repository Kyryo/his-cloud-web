import { cn } from "@/lib/utils";

type WorkspaceAvatarProps = {
  name: string;
  className?: string;
};

const WORKSPACE_AVATAR_TONES = [
  {
    bg: "bg-[linear-gradient(160deg,#1aa39c_0%,#0b6e6e_58%,#085858_100%)]",
    text: "text-[#f3fffe]",
    ring: "ring-[#064848]/35",
  },
  {
    bg: "bg-[linear-gradient(160deg,#4d9a68_0%,#2f6a48_58%,#24553a_100%)]",
    text: "text-[#f2faf5]",
    ring: "ring-[#1c4030]/35",
  },
  {
    bg: "bg-[linear-gradient(160deg,#d4892e_0%,#b86a1f_58%,#935314_100%)]",
    text: "text-[#fff8ee]",
    ring: "ring-[#7a430e]/30",
  },
  {
    bg: "bg-[linear-gradient(160deg,#4f86b0_0%,#36698d_58%,#2a5473_100%)]",
    text: "text-[#f3f8fc]",
    ring: "ring-[#1e3f58]/35",
  },
  {
    bg: "bg-[linear-gradient(160deg,#d4775c_0%,#b0563d_58%,#8d4230_100%)]",
    text: "text-[#fff6f3]",
    ring: "ring-[#6d3224]/30",
  },
  {
    bg: "bg-[linear-gradient(160deg,#66727c_0%,#4b575f_58%,#3a444b_100%)]",
    text: "text-[#f5f7f8]",
    ring: "ring-[#2a3136]/35",
  },
  {
    bg: "bg-[linear-gradient(160deg,#8a9a45_0%,#6b7a32_58%,#556228_100%)]",
    text: "text-[#f7faee]",
    ring: "ring-[#3d4720]/35",
  },
  {
    bg: "bg-[linear-gradient(160deg,#c46a7d_0%,#9a4458_58%,#7c3647_100%)]",
    text: "text-[#fff4f6]",
    ring: "ring-[#5c2835]/30",
  },
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
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-[0.04em] shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(0,0,0,0.12),0_1px_2px_rgba(31,42,36,0.14)] ring-1 ring-inset",
        tone.bg,
        tone.text,
        tone.ring,
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
