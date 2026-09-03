export function hasRichTextContent(value: string): boolean {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}
