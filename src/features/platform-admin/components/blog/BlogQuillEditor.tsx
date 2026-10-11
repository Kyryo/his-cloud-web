"use client";

import "react-quill-new/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.min.css";
import "@/features/platform-admin/components/blog/blog-content.css";

import hljs from "highlight.js/lib/common";
import katex from "katex";
import QuillTableBetter from "quill-table-better";
import { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill, type EmitterSource } from "react-quill-new";

import { createBlogQuillModules } from "@/features/platform-admin/components/blog/blog-quill.config";
import type { QuillOp } from "@/features/platform-admin/types/quill-delta.types";

/** Quill's formula format reads KaTeX from window; table-better must be registered before any editor mounts. */
if (typeof window !== "undefined") {
  Object.assign(window, { katex });
  Quill.register({ "modules/table-better": QuillTableBetter }, true);
}

export type BlogQuillEditorProps = {
  initialOps: QuillOp[];
  onChange: (ops: QuillOp[], source: EmitterSource) => void;
  uploadImage: (file: File) => Promise<string>;
  onUploadError: (message: string) => void;
};

/**
 * Client-only React Quill (react-quill-new, Quill 2) editor. Load it with next/dynamic
 * and ssr:false: Quill touches the DOM as soon as it is imported.
 */
export default function BlogQuillEditor({ initialOps, onChange, uploadImage, onUploadError }: BlogQuillEditorProps) {
  const editorRef = useRef<ReactQuill>(null);
  const [modules] = useState(() => createBlogQuillModules({ hljs, uploadImage, onUploadError }));

  useEffect(() => {
    const quill = editorRef.current?.getEditor();
    if (!quill) {
      return;
    }
    // updateContents (not setContents) is required for quill-table-better to rebuild table cells.
    quill.setContents([], "silent");
    quill.updateContents(initialOps, "silent");
    quill.history.clear();
  }, [initialOps]);

  return (
    <ReactQuill
      ref={editorRef}
      theme="snow"
      modules={modules}
      placeholder="Start writing…"
      className="blog-quill"
      onChange={(_html, _delta, source, editor) => onChange(editor.getContents().ops, source)}
    />
  );
}
