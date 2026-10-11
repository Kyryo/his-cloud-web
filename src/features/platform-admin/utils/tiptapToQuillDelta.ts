import type { TipTapDoc, TipTapNode } from "@/features/platform-admin/types/blog.types";
import type { QuillAttributes, QuillOp } from "@/features/platform-admin/types/quill-delta.types";
import {
  CHECKED_ITEM_PREFIX,
  UNCHECKED_ITEM_PREFIX,
} from "@/features/platform-admin/utils/blog-content-formats";

const MARK_TO_QUILL: Record<string, string> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strike: "strike",
  code: "code",
};

function inlineAttributes(node: TipTapNode): QuillAttributes | undefined {
  const attributes: QuillAttributes = {};
  for (const mark of node.marks ?? []) {
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      attributes.link = mark.attrs.href;
    } else if (MARK_TO_QUILL[mark.type]) {
      attributes[MARK_TO_QUILL[mark.type]] = true;
    }
  }
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function pushInline(ops: QuillOp[], nodes: TipTapNode[] | undefined, lineAttributes?: QuillAttributes) {
  for (const node of nodes ?? []) {
    if (node.type === "text" && node.text) {
      const attributes = inlineAttributes(node);
      ops.push(attributes ? { insert: node.text, attributes } : { insert: node.text });
    } else if (node.type === "hardBreak") {
      // Quill has no soft line break, so a hard break starts a new line with the same formatting.
      ops.push(lineAttributes ? { insert: "\n", attributes: lineAttributes } : { insert: "\n" });
    }
  }
}

function pushLine(ops: QuillOp[], nodes: TipTapNode[] | undefined, lineAttributes?: QuillAttributes) {
  pushInline(ops, nodes, lineAttributes);
  ops.push(lineAttributes ? { insert: "\n", attributes: lineAttributes } : { insert: "\n" });
}

function firstText(node: TipTapNode): string {
  const first = node.content?.[0];
  return first?.type === "text" ? first.text ?? "" : "";
}

/** Bullet items that start with ☑ / ☐ were checklist items in the editor. */
function checklistState(paragraph: TipTapNode): { list: string; content: TipTapNode[] | undefined } | null {
  const text = firstText(paragraph);
  const prefix = text.startsWith(CHECKED_ITEM_PREFIX)
    ? CHECKED_ITEM_PREFIX
    : text.startsWith(UNCHECKED_ITEM_PREFIX)
      ? UNCHECKED_ITEM_PREFIX
      : null;
  if (!prefix || !paragraph.content) {
    return null;
  }
  const [first, ...rest] = paragraph.content;
  const trimmed = (first.text ?? "").slice(prefix.length);
  const content = trimmed ? [{ ...first, text: trimmed }, ...rest] : rest;
  return { list: prefix === CHECKED_ITEM_PREFIX ? "checked" : "unchecked", content };
}

function pushList(ops: QuillOp[], list: TipTapNode, indent: number) {
  const baseType = list.type === "orderedList" ? "ordered" : "bullet";
  for (const item of list.content ?? []) {
    for (const child of item.content ?? []) {
      if (child.type === "bulletList" || child.type === "orderedList") {
        pushList(ops, child, indent + 1);
        continue;
      }
      const checklist = baseType === "bullet" ? checklistState(child) : null;
      const attributes: QuillAttributes = { list: checklist?.list ?? baseType };
      if (indent > 0) {
        attributes.indent = indent;
      }
      pushLine(ops, checklist ? checklist.content : child.content, attributes);
    }
  }
}

function pushTable(ops: QuillOp[], table: TipTapNode, tableIndex: number) {
  ops.push({
    insert: "\n",
    attributes: { "table-temporary": { style: "width: 100%", "data-class": "ql-table-better" } },
  });
  (table.content ?? []).forEach((row, rowIndex) => {
    const rowId = `row-t${tableIndex}r${rowIndex}`;
    (row.content ?? []).forEach((cell, cellIndex) => {
      const isHeader = cell.type === "tableHeader";
      const cellId = `cell-t${tableIndex}r${rowIndex}c${cellIndex}`;
      const attributes: QuillAttributes = isHeader
        ? { "table-th-block": cellId, "table-th": { "data-row": rowId } }
        : { "table-cell-block": cellId, "table-cell": { "data-row": rowId } };
      const blocks = cell.content?.length ? cell.content : [{ type: "paragraph" }];
      for (const block of blocks) {
        pushLine(ops, block.content, attributes);
      }
    });
  });
}

function pushBlock(ops: QuillOp[], node: TipTapNode, counters: { tables: number }) {
  switch (node.type) {
    case "paragraph":
      pushLine(ops, node.content);
      return;
    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 2;
      pushLine(ops, node.content, { header: level });
      return;
    }
    case "blockquote":
      for (const child of node.content ?? []) {
        pushLine(ops, child.content, { blockquote: true });
      }
      return;
    case "codeBlock": {
      const language = typeof node.attrs?.language === "string" && node.attrs.language ? node.attrs.language : "plain";
      const text = (node.content ?? []).map((child) => child.text ?? "").join("");
      for (const line of text.split("\n")) {
        if (line) {
          ops.push({ insert: line });
        }
        ops.push({ insert: "\n", attributes: { "code-block": language } });
      }
      return;
    }
    case "bulletList":
    case "orderedList":
      pushList(ops, node, 0);
      return;
    case "image":
      if (typeof node.attrs?.src === "string") {
        const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : undefined;
        ops.push(alt ? { insert: { image: node.attrs.src }, attributes: { alt } } : { insert: { image: node.attrs.src } });
        ops.push({ insert: "\n" });
      }
      return;
    case "youtube":
      if (typeof node.attrs?.src === "string") {
        ops.push({ insert: { video: node.attrs.src } });
      }
      return;
    case "table":
      pushTable(ops, node, counters.tables);
      counters.tables += 1;
      return;
    case "horizontalRule":
      ops.push({ insert: "———\n" });
      return;
    default:
      if (node.content) {
        pushLine(ops, node.content);
      }
  }
}

/** Converts the stored TipTap document into Quill Delta ops for the content editor. */
export function tiptapToQuillDelta(doc: TipTapDoc | null | undefined): QuillOp[] {
  const ops: QuillOp[] = [];
  const counters = { tables: 0 };
  for (const node of doc?.content ?? []) {
    pushBlock(ops, node, counters);
  }
  return ops;
}

export function hasTipTapContent(doc: TipTapDoc | null | undefined): boolean {
  return (doc?.content ?? []).some(
    (node) => node.type !== "paragraph" || (node.content?.length ?? 0) > 0,
  );
}
