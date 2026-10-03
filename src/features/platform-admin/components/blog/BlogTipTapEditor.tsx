"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { uploadBlogImage } from "@/features/platform-admin/services/blog-cms.service";
import type { TipTapDoc } from "@/features/platform-admin/types/blog.types";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
  }),
  Underline,
  Link.configure({ openOnClick: false }),
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Youtube.configure({ width: 640, height: 360 }),
  Placeholder.configure({ placeholder: "Write the post body…" }),
];

type BlogTipTapEditorProps = {
  value?: TipTapDoc | null;
  onChange: (doc: TipTapDoc, plainText: string) => void;
  className?: string;
};

export function BlogTipTapEditor({
  value,
  onChange,
  className,
}: BlogTipTapEditorProps) {
  const editor = useEditor({
    extensions,
    content: value || { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as TipTapDoc, current.getText());
    },
  });

  useEffect(() => {
    if (!editor || !value) {
      return;
    }
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  async function handleImage() {
    if (!editor) {
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      const uploaded = await uploadBlogImage(file, "inline");
      editor.chain().focus().setImage({ src: uploaded.url }).run();
    };
    input.click();
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-brand-border px-4 py-6 text-sm text-brand-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-brand-border bg-white",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-brand-border bg-brand-canvas/40 p-2">
        {(
          [
            ["Bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
            ["Italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
            ["Underline", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline")],
            ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
            ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 })],
            ["Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote")],
            ["Bullet", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
            ["Number", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
            ["Code", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
          ] as const
        ).map(([label, onClick, active]) => (
          <Button
            key={label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            className="h-7 px-2 text-xs"
            onClick={onClick}
          >
            {label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("URL", prev || "https://");
            if (url === null) {
              return;
            }
            if (!url) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => void handleImage()}
        >
          Image
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Table
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => {
            const url = window.prompt("YouTube URL");
            if (!url) {
              return;
            }
            editor.commands.setYoutubeVideo({ src: url });
          }}
        >
          YouTube
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
