import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FetchErrorNoticeProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function FetchErrorNotice({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: FetchErrorNoticeProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
        className,
      )}
    >
      <p>{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-1 h-auto p-0 text-red-700 underline-offset-2 hover:text-red-800"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
