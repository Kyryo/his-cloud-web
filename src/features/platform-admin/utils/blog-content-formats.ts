/**
 * Formats the stored body (TipTap JSON) and the public blog renderer support.
 * Anything else the Quill toolbar offers is editor-only and is removed on save.
 */
export const SUPPORTED_INLINE_FORMATS = [
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "link",
] as const;

export const UNSUPPORTED_FORMAT_LABELS: Record<string, string> = {
  color: "Text colour",
  background: "Highlight colour",
  font: "Font",
  size: "Text size",
  script: "Subscript / superscript",
  align: "Alignment",
  direction: "Text direction",
  indent: "Indentation",
  formula: "Formulas (kept as plain text)",
};

export const CHECKED_ITEM_PREFIX = "☑ ";
export const UNCHECKED_ITEM_PREFIX = "☐ ";

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com", "m.youtube.com"];

export function isYoutubeUrl(url: string): boolean {
  try {
    return YOUTUBE_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}
