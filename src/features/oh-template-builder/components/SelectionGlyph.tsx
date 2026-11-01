import type { OhCatalogSelectionMode } from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

/** Static radio / checkbox mark showing how staff will pick items on the form. */
export function SelectionGlyph({
  mode,
  className,
}: {
  mode: OhCatalogSelectionMode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4 shrink-0 border-[1.5px] border-slate-300 bg-white",
        mode === "exclusive" ? "rounded-full" : "rounded-[5px]",
        className,
      )}
    />
  );
}
