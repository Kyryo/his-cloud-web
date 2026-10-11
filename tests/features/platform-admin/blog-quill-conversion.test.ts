import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import type { TipTapDoc } from "@/features/platform-admin/types/blog.types";
import type { QuillOp } from "@/features/platform-admin/types/quill-delta.types";
import { quillDeltaToTiptap } from "@/features/platform-admin/utils/quillDeltaToTiptap";
import { hasTipTapContent, tiptapToQuillDelta } from "@/features/platform-admin/utils/tiptapToQuillDelta";

/** Same extension set as the public blog renderer (hmis-cloud-blog/lib/render.ts). */
const PUBLIC_RENDERER_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  Youtube,
];

const SAMPLE_DOC: TipTapDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Intro" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Bold", marks: [{ type: "bold" }] },
        { type: "text", text: " and " },
        { type: "text", text: "link", marks: [{ type: "link", attrs: { href: "https://example.com" } }] },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "One" }] },
            {
              type: "orderedList",
              content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Nested" }] }] }],
            },
          ],
        },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "☑ Done" }] }] },
      ],
    },
    { type: "codeBlock", attrs: { language: "javascript" }, content: [{ type: "text", text: "const a = 1;\nconsole.log(a);" }] },
    { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Quote" }] }] },
    { type: "image", attrs: { src: "https://example.com/a.png", alt: "Alt" } },
    { type: "youtube", attrs: { src: "https://www.youtube.com/embed/abc" } },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "H1" }] }] },
            { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "H2" }] }] },
          ],
        },
        {
          type: "tableRow",
          content: [
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "A" }] }] },
            { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "B" }] }] },
          ],
        },
      ],
    },
  ],
};

describe("tiptapToQuillDelta", () => {
  it("maps blocks to Quill line formats", () => {
    const ops = tiptapToQuillDelta(SAMPLE_DOC);
    expect(ops).toContainEqual({ insert: "\n", attributes: { header: 2 } });
    expect(ops).toContainEqual({ insert: "\n", attributes: { list: "ordered", indent: 1 } });
    expect(ops).toContainEqual({ insert: "\n", attributes: { list: "checked" } });
    expect(ops).toContainEqual({ insert: "\n", attributes: { "code-block": "javascript" } });
    expect(ops).toContainEqual({ insert: { video: "https://www.youtube.com/embed/abc" } });
    expect(ops).toContainEqual({
      insert: "\n",
      attributes: { "table-th-block": "cell-t0r0c0", "table-th": { "data-row": "row-t0r0" } },
    });
  });

  it("reports whether a document has content", () => {
    expect(hasTipTapContent(null)).toBe(false);
    expect(hasTipTapContent({ type: "doc", content: [{ type: "paragraph" }] })).toBe(false);
    expect(hasTipTapContent(SAMPLE_DOC)).toBe(true);
  });
});

describe("quillDeltaToTiptap", () => {
  it("round-trips supported content without loss", () => {
    const { doc, droppedFormats } = quillDeltaToTiptap(tiptapToQuillDelta(SAMPLE_DOC));
    expect(droppedFormats).toEqual([]);
    expect(doc).toEqual(SAMPLE_DOC);
  });

  it("produces documents the public renderer can render", () => {
    const { doc } = quillDeltaToTiptap(tiptapToQuillDelta(SAMPLE_DOC));
    const html = generateHTML(doc, PUBLIC_RENDERER_EXTENSIONS);
    expect(html).toContain("<h2>Intro</h2>");
    expect(html).toContain("<table");
    expect(html).toContain("data-youtube-video");
  });

  it("drops unsupported formats and reports them", () => {
    const ops: QuillOp[] = [
      { insert: "Red", attributes: { color: "#ff0000", bold: true } },
      { insert: "\n", attributes: { align: "center" } },
      { insert: { formula: "e=mc^2" } },
      { insert: "\n" },
    ];
    const { doc, droppedFormats, plainText } = quillDeltaToTiptap(ops);
    expect(droppedFormats).toEqual(expect.arrayContaining(["Text colour", "Alignment", "Formulas (kept as plain text)"]));
    expect(doc.content?.[0]).toEqual({ type: "paragraph", content: [{ type: "text", text: "Red", marks: [{ type: "bold" }] }] });
    expect(plainText).toBe("Red\ne=mc^2");
    expect(() => generateHTML(doc, PUBLIC_RENDERER_EXTENSIONS)).not.toThrow();
  });

  it("turns non-YouTube videos into links and splits inline images out of paragraphs", () => {
    const { doc } = quillDeltaToTiptap([
      { insert: "Before" },
      { insert: { image: "https://example.com/i.png" } },
      { insert: "After\n" },
      { insert: { video: "https://player.vimeo.com/video/1" } },
    ]);
    expect(doc.content?.map((node) => node.type)).toEqual(["paragraph", "image", "paragraph", "paragraph"]);
    expect(doc.content?.[3].content?.[0].marks?.[0]).toEqual({ type: "link", attrs: { href: "https://player.vimeo.com/video/1" } });
  });

  it("returns an empty document for an empty editor", () => {
    expect(quillDeltaToTiptap([{ insert: "\n" }]).doc).toEqual({ type: "doc", content: [] });
  });
});
