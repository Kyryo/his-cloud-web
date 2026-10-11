import type { TipTapNode } from "@/features/platform-admin/types/blog.types";
import type {
  QuillAttributes,
  QuillEmbed,
  QuillOp,
  QuillToTipTapResult,
} from "@/features/platform-admin/types/quill-delta.types";
import {
  CHECKED_ITEM_PREFIX,
  SUPPORTED_INLINE_FORMATS,
  UNCHECKED_ITEM_PREFIX,
  UNSUPPORTED_FORMAT_LABELS,
  isYoutubeUrl,
} from "@/features/platform-admin/utils/blog-content-formats";

type InlinePiece =
  | { kind: "text"; text: string; attributes?: QuillAttributes }
  | { kind: "image"; src: string; alt?: string }
  | { kind: "formula"; value: string };

type Line =
  | { kind: "text"; pieces: InlinePiece[]; attributes: QuillAttributes }
  | { kind: "video"; src: string };

const SUPPORTED_INLINE = new Set<string>(SUPPORTED_INLINE_FORMATS);
const IGNORED_LINE_KEYS = new Set(["table-temporary", "table-col"]);

function isTableLine(attributes: QuillAttributes): boolean {
  return "table-cell" in attributes || "table-th" in attributes;
}

function isSkippedLine(attributes: QuillAttributes): boolean {
  return Object.keys(attributes).some((key) => IGNORED_LINE_KEYS.has(key));
}

class DroppedFormats {
  private readonly labels = new Set<string>();

  add(key: string) {
    const label = UNSUPPORTED_FORMAT_LABELS[key];
    if (label) {
      this.labels.add(label);
    }
  }

  list(): string[] {
    return [...this.labels];
  }
}

function splitLines(ops: QuillOp[], dropped: DroppedFormats): Line[] {
  const lines: Line[] = [];
  let pieces: InlinePiece[] = [];

  for (const op of ops) {
    if (typeof op.insert === "string") {
      const segments = op.insert.split("\n");
      segments.forEach((segment, index) => {
        if (segment) {
          pieces.push({ kind: "text", text: segment, attributes: op.attributes });
        }
        if (index < segments.length - 1) {
          lines.push({ kind: "text", pieces, attributes: op.attributes ?? {} });
          pieces = [];
        }
      });
    } else if (op.insert) {
      const embed: QuillEmbed = op.insert;
      if (typeof embed.video === "string") {
        if (pieces.length > 0) {
          lines.push({ kind: "text", pieces, attributes: {} });
          pieces = [];
        }
        lines.push({ kind: "video", src: embed.video });
      } else if (typeof embed.image === "string") {
        const alt = typeof op.attributes?.alt === "string" ? op.attributes.alt : undefined;
        pieces.push({ kind: "image", src: embed.image, alt });
      } else if (typeof embed.formula === "string") {
        dropped.add("formula");
        pieces.push({ kind: "formula", value: embed.formula });
      }
    }
  }
  if (pieces.length > 0) {
    lines.push({ kind: "text", pieces, attributes: {} });
  }
  return lines;
}

function textNode(text: string, attributes: QuillAttributes | undefined, dropped: DroppedFormats): TipTapNode {
  const marks: NonNullable<TipTapNode["marks"]> = [];
  for (const [key, value] of Object.entries(attributes ?? {})) {
    if (!value || key === "alt") {
      continue;
    }
    if (!SUPPORTED_INLINE.has(key)) {
      dropped.add(key);
      continue;
    }
    marks.push(key === "link" ? { type: "link", attrs: { href: String(value) } } : { type: key });
  }
  return marks.length > 0 ? { type: "text", text, marks } : { type: "text", text };
}

/** Merges adjacent text with identical marks so the stored JSON stays minimal. */
function appendText(inline: TipTapNode[], node: TipTapNode) {
  const previous = inline[inline.length - 1];
  if (previous?.type === "text" && JSON.stringify(previous.marks ?? []) === JSON.stringify(node.marks ?? [])) {
    previous.text = `${previous.text ?? ""}${node.text ?? ""}`;
    return;
  }
  inline.push(node);
}

/** Text pieces become inline content; images split the line because TipTap images are blocks. */
function lineToBlocks(
  pieces: InlinePiece[],
  wrap: (content: TipTapNode[]) => TipTapNode,
  dropped: DroppedFormats,
): TipTapNode[] {
  const blocks: TipTapNode[] = [];
  let inline: TipTapNode[] = [];
  let hasImage = false;
  for (const piece of pieces) {
    if (piece.kind === "image") {
      if (inline.length > 0) {
        blocks.push(wrap(inline));
        inline = [];
      }
      hasImage = true;
      blocks.push({ type: "image", attrs: piece.alt ? { src: piece.src, alt: piece.alt } : { src: piece.src } });
    } else if (piece.kind === "formula") {
      inline.push({ type: "text", text: piece.value, marks: [{ type: "code" }] });
    } else {
      appendText(inline, textNode(piece.text, piece.attributes, dropped));
    }
  }
  if (inline.length > 0 || !hasImage) {
    blocks.push(wrap(inline));
  }
  return blocks;
}

function paragraph(content: TipTapNode[]): TipTapNode {
  return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
}

function lineText(pieces: InlinePiece[]): string {
  return pieces
    .map((piece) => (piece.kind === "text" ? piece.text : piece.kind === "formula" ? piece.value : ""))
    .join("");
}

type ListFrame = { type: "bulletList" | "orderedList"; node: TipTapNode };

class BlockBuilder {
  readonly blocks: TipTapNode[] = [];
  private listStack: ListFrame[] = [];
  private tableLines: Array<{ pieces: InlinePiece[]; attributes: QuillAttributes }> = [];
  private readonly codeLines = new WeakMap<TipTapNode, string[]>();

  constructor(private readonly dropped: DroppedFormats) {}

  add(line: Line) {
    if (line.kind === "video") {
      this.flush();
      if (isYoutubeUrl(line.src)) {
        this.blocks.push({ type: "youtube", attrs: { src: line.src } });
      } else {
        this.blocks.push(paragraph([{ type: "text", text: line.src, marks: [{ type: "link", attrs: { href: line.src } }] }]));
      }
      return;
    }
    const { attributes, pieces } = line;
    if (isSkippedLine(attributes)) {
      return;
    }
    if (isTableLine(attributes)) {
      this.listStack = [];
      this.tableLines.push({ pieces, attributes });
      return;
    }
    this.flushTable();
    if (typeof attributes.list === "string") {
      this.addListItem(pieces, attributes);
      return;
    }
    this.listStack = [];
    this.trackDroppedLineFormats(attributes, ["indent"]);
    this.addBlockLine(pieces, attributes);
  }

  flush() {
    this.flushTable();
    this.listStack = [];
  }

  private trackDroppedLineFormats(attributes: QuillAttributes, extra: string[] = []) {
    for (const key of ["align", "direction", ...extra]) {
      if (attributes[key]) {
        this.dropped.add(key);
      }
    }
  }

  private addBlockLine(pieces: InlinePiece[], attributes: QuillAttributes) {
    const last = this.blocks[this.blocks.length - 1];
    if (typeof attributes["code-block"] === "string") {
      const language = attributes["code-block"] === "plain" ? null : attributes["code-block"];
      const text = lineText(pieces);
      const lines = last ? this.codeLines.get(last) : undefined;
      if (last?.type === "codeBlock" && lines && (last.attrs?.language ?? null) === language) {
        lines.push(text);
        last.content = [{ type: "text", text: lines.join("\n") }];
      } else {
        const block: TipTapNode = { type: "codeBlock", attrs: { language }, ...(text ? { content: [{ type: "text", text }] } : {}) };
        this.codeLines.set(block, [text]);
        this.blocks.push(block);
      }
      return;
    }
    if (attributes.blockquote) {
      const children = lineToBlocks(pieces, paragraph, this.dropped).filter((node) => node.type === "paragraph");
      if (last?.type === "blockquote") {
        last.content = [...(last.content ?? []), ...children];
      } else {
        this.blocks.push({ type: "blockquote", content: children });
      }
      return;
    }
    if (typeof attributes.header === "number") {
      const level = attributes.header;
      this.blocks.push(...lineToBlocks(pieces, (content) => ({ type: "heading", attrs: { level }, ...(content.length ? { content } : {}) }), this.dropped));
      return;
    }
    this.blocks.push(...lineToBlocks(pieces, paragraph, this.dropped));
  }

  private addListItem(pieces: InlinePiece[], attributes: QuillAttributes) {
    this.trackDroppedLineFormats(attributes);
    const kind = String(attributes.list);
    const type = kind === "ordered" ? "orderedList" : "bulletList";
    const depth = typeof attributes.indent === "number" ? Math.max(0, attributes.indent) : 0;

    while (this.listStack.length > depth + 1) {
      this.listStack.pop();
    }
    if (this.listStack.length === depth + 1 && this.listStack[depth].type !== type) {
      this.listStack.pop();
    }
    while (this.listStack.length < depth + 1) {
      const list: TipTapNode = { type, content: [] };
      const parent = this.listStack[this.listStack.length - 1];
      if (!parent) {
        this.blocks.push(list);
      } else {
        const items = parent.node.content ?? [];
        if (items.length === 0) {
          items.push({ type: "listItem", content: [paragraph([])] });
        }
        const lastItem = items[items.length - 1];
        lastItem.content = [...(lastItem.content ?? []), list];
        parent.node.content = items;
      }
      this.listStack.push({ type, node: list });
    }

    const prefix = kind === "checked" ? CHECKED_ITEM_PREFIX : kind === "unchecked" ? UNCHECKED_ITEM_PREFIX : "";
    const itemPieces: InlinePiece[] = prefix ? [{ kind: "text", text: prefix }, ...pieces] : pieces;
    const content = lineToBlocks(itemPieces, paragraph, this.dropped);
    const top = this.listStack[this.listStack.length - 1].node;
    top.content = [...(top.content ?? []), { type: "listItem", content }];
  }

  private flushTable() {
    if (this.tableLines.length === 0) {
      return;
    }
    const rows = new Map<string, Map<string, { header: boolean; paragraphs: TipTapNode[] }>>();
    for (const { pieces, attributes } of this.tableLines) {
      const header = "table-th" in attributes;
      const cellAttrs = (attributes[header ? "table-th" : "table-cell"] ?? {}) as QuillAttributes;
      const rowId = String(cellAttrs["data-row"] ?? "row");
      const cellId = String(attributes[header ? "table-th-block" : "table-cell-block"] ?? `${rowId}-cell`);
      const row = rows.get(rowId) ?? new Map();
      const cell = row.get(cellId) ?? { header, paragraphs: [] };
      cell.paragraphs.push(...lineToBlocks(pieces, paragraph, this.dropped).filter((node) => node.type === "paragraph"));
      row.set(cellId, cell);
      rows.set(rowId, row);
    }
    this.tableLines = [];
    this.blocks.push({
      type: "table",
      content: [...rows.values()].map((cells) => ({
        type: "tableRow",
        content: [...cells.values()].map((cell) => ({
          type: cell.header ? "tableHeader" : "tableCell",
          content: cell.paragraphs.length > 0 ? cell.paragraphs : [paragraph([])],
        })),
      })),
    });
  }
}

function isEmptyParagraph(node: TipTapNode | undefined): boolean {
  return node?.type === "paragraph" && !(node.content?.length);
}

function nodeText(node: TipTapNode): string {
  if (node.type === "text") {
    return node.text ?? "";
  }
  const separator = ["bulletList", "orderedList", "table", "tableRow", "blockquote", "listItem"].includes(node.type) ? "\n" : "";
  return (node.content ?? []).map(nodeText).join(separator);
}

/**
 * Converts the Quill editor contents into the TipTap JSON the platform API stores.
 * Only nodes and marks the public blog renderer understands are emitted, so a saved
 * post can never break the public page; anything else is reported in droppedFormats.
 */
export function quillDeltaToTiptap(ops: QuillOp[]): QuillToTipTapResult {
  const dropped = new DroppedFormats();
  const builder = new BlockBuilder(dropped);
  for (const line of splitLines(ops, dropped)) {
    builder.add(line);
  }
  builder.flush();

  const blocks = builder.blocks;
  while (blocks.length > 0 && isEmptyParagraph(blocks[blocks.length - 1])) {
    blocks.pop();
  }
  const plainText = blocks.map(nodeText).filter(Boolean).join("\n").trim();
  return { doc: { type: "doc", content: blocks }, plainText, droppedFormats: dropped.list() };
}
