import Heading from "@tiptap/extension-heading";
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

import type { PublicBlogTipTapDoc } from "@/features/brand/blog/types";
import { slugifyHeading } from "@/features/brand/blog/utils/format";

const HeadingWithId = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level || 2;
    const id = slugifyHeading(node.textContent) || `section-${level}`;
    return [`h${level}`, { ...HTMLAttributes, id }, 0];
  },
});

const extensions = [
  StarterKit.configure({ heading: false }),
  HeadingWithId.configure({ levels: [2, 3, 4] }),
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  Youtube.configure({ width: 640, height: 360 }),
];

/**
 * TipTap JSON → HTML. Prefer calling from a client boundary when the runtime
 * lacks a DOM; TipTap's generateHTML from `@tiptap/react` expects browser APIs.
 */
export function renderPublicBlogPostHtml(
  doc?: PublicBlogTipTapDoc | null,
): string {
  if (!doc || doc.type !== "doc") {
    return "";
  }
  try {
    const raw = generateHTML(doc, extensions);
    const idCounts = new Map<string, number>();
    return raw.replace(
      /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
      (_match, tag, attrs, inner) => {
        const plain = String(inner).replace(/<[^>]+>/g, "").trim();
        const baseId = slugifyHeading(plain) || `section-${tag}`;
        const count = idCounts.get(baseId) || 0;
        idCounts.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}-${count}`;
        const cleanAttrs = String(attrs).replace(/\sid="[^"]*"/gi, "");
        return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
      },
    );
  } catch {
    return "";
  }
}
