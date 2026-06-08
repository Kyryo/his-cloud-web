import { Loader2 } from "lucide-react";

type UpdateUserTabLoaderProps = {
  message: string;
};

export function UpdateUserTabLoader({ message }: UpdateUserTabLoaderProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-brand-muted">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {message}
    </div>
  );
}
