import type { HLJSApi } from "highlight.js";
import type Quill from "quill";
import type { Range } from "quill";
import QuillTableBetter from "quill-table-better";

/**
 * Full Quill 2 toolbar requested for the blog editor. Formats outside what the stored
 * TipTap body supports still work while editing but are removed on save (see
 * blog-content-formats.ts); the editor sheet tells the author when that happens.
 */
export const BLOG_QUILL_TOOLBAR = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }, { size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }, { align: [] }],
  ["link", "image", "video", "formula"],
  ["table-better"],
  ["clean"],
];

export const BLOG_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

type ToolbarContext = { quill: Quill };

export type BlogQuillModuleOptions = {
  hljs: HLJSApi;
  uploadImage: (file: File) => Promise<string>;
  onUploadError: (message: string) => void;
};

async function insertUploadedImages(quill: Quill, index: number, files: File[], options: BlogQuillModuleOptions) {
  let position = index;
  for (const file of files) {
    try {
      const url = await options.uploadImage(file);
      quill.insertEmbed(position, "image", url, "user");
      position += 1;
    } catch (error) {
      options.onUploadError(error instanceof Error ? error.message : "Image upload failed.");
    }
  }
  quill.setSelection(position, 0, "user");
}

function pickImageFiles(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = BLOG_IMAGE_MIME_TYPES.join(",");
    input.multiple = true;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.click();
  });
}

/** Modules object for ReactQuill. Create it once per editor instance; a new object remounts Quill. */
export function createBlogQuillModules(options: BlogQuillModuleOptions) {
  return {
    syntax: { hljs: options.hljs },
    table: false,
    "table-better": {
      language: "en_US",
      menus: ["column", "row", "merge", "table", "cell", "wrap", "copy", "delete"],
      toolbarTable: true,
    },
    keyboard: { bindings: QuillTableBetter.keyboardBindings },
    toolbar: {
      container: BLOG_QUILL_TOOLBAR,
      handlers: {
        image(this: ToolbarContext) {
          const quill = this.quill;
          const range = quill.getSelection(true);
          void pickImageFiles().then((files) => insertUploadedImages(quill, range.index, files, options));
        },
      },
    },
    // Pasted and dropped images are uploaded to the blog uploads API instead of being inlined as base64.
    uploader: {
      mimetypes: BLOG_IMAGE_MIME_TYPES,
      handler(this: ToolbarContext, range: Range, files: File[]) {
        void insertUploadedImages(this.quill, range.index, files, options);
      },
    },
    history: { delay: 800, maxStack: 200, userOnly: true },
  };
}
