import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BLOG_MOCK_DATA_NOTICE } from "@/features/platform-admin/constants/blog-mock-stats";

/** Marks numbers that come from the dummy analytics in blog-mock-stats.ts. */
export function BlogSampleDataTag() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help rounded px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-amber-700 ring-1 ring-inset ring-amber-200">
          Sample
        </span>
      </TooltipTrigger>
      <TooltipContent>{BLOG_MOCK_DATA_NOTICE}</TooltipContent>
    </Tooltip>
  );
}
