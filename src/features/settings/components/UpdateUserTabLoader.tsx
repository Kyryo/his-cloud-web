import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";

type UpdateUserTabLoaderProps = {
  message: string;
};

export function UpdateUserTabLoader({ message }: UpdateUserTabLoaderProps) {
  return (
    <SettingsContentSkeleton rows={4} showHeader={false} label={message} />
  );
}
