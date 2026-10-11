import { TriangleAlert } from "lucide-react";

type BlogEditorStatusBarProps = {
  plainText: string;
  droppedFormats: string[];
  dirty: boolean;
};

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const WORDS_PER_MINUTE = 220;

export function BlogEditorStatusBar({ plainText, droppedFormats, dirty }: BlogEditorStatusBarProps) {
  const words = countWords(plainText);
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dash-border/80 px-6 py-2 text-xs text-dash-muted">
      <span className="tabular-nums">{words.toLocaleString()} words · {minutes} min read</span>
      <span>{dirty ? "Unsaved changes" : "No changes"}</span>
      {droppedFormats.length > 0 ? (
        <span className="flex items-center gap-1.5 text-amber-700" role="status">
          <TriangleAlert className="size-3.5" aria-hidden="true" />
          Not kept on the public blog: {droppedFormats.join(", ")}
        </span>
      ) : null}
    </div>
  );
}
