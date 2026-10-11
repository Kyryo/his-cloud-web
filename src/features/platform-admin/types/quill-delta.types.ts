import type { TipTapDoc } from "@/features/platform-admin/types/blog.types";

/** Minimal Quill Delta shapes used to convert between the editor and stored TipTap JSON. */
export type QuillAttributes = Record<string, unknown>;

export type QuillEmbed = Record<string, unknown>;

export type QuillOp = {
  insert?: string | QuillEmbed;
  attributes?: QuillAttributes;
};

export type QuillToTipTapResult = {
  doc: TipTapDoc;
  plainText: string;
  /** Human labels for editor formats the public blog cannot store yet. */
  droppedFormats: string[];
};
