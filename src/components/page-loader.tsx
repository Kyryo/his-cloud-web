import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

/** Use when page chrome (title, tabs) sits above the loader. */
export const PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS =
  "min-h-[calc(100dvh-20rem)] lg:min-h-[calc(100dvh-19rem)]";

type PageLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export function PageLoader({
  message = "Loading...",
  fullScreen = false,
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center px-4",
        fullScreen
          ? "min-h-screen"
          : "min-h-[calc(100dvh-10rem)] py-10 lg:min-h-[calc(100dvh-9rem)]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner message={message} />
    </div>
  );
}
