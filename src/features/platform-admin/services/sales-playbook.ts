import { readFile } from "node:fs/promises";
import path from "node:path";

const PLAYBOOK_RELATIVE_PATH = path.join(
  "docs",
  "company",
  "sales",
  "playbook.md",
);

export type SalesPlaybookSection = {
  id: string;
  label: string;
};

export type ParsedSalesPlaybook = {
  title: string;
  versionLabel: string | null;
  pullQuote: string | null;
  sections: SalesPlaybookSection[];
  bodyMarkdown: string;
};

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function readSalesPlaybookMarkdown(): Promise<string> {
  const absolutePath = path.join(process.cwd(), PLAYBOOK_RELATIVE_PATH);
  return readFile(absolutePath, "utf8");
}

export function parseSalesPlaybookMarkdown(
  markdown: string,
): ParsedSalesPlaybook {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");

  let title = "Sales playbook";
  let versionLabel: string | null = null;
  let pullQuote: string | null = null;
  let cursor = 0;

  if (lines[cursor]?.startsWith("# ")) {
    title = lines[cursor].slice(2).trim();
    cursor += 1;
  }

  while (cursor < lines.length && lines[cursor].trim() === "") {
    cursor += 1;
  }

  const versionMatch = lines[cursor]?.match(/^\*(.+)\*$/);
  if (versionMatch) {
    versionLabel = versionMatch[1].trim();
    cursor += 1;
  }

  while (cursor < lines.length && lines[cursor].trim() === "") {
    cursor += 1;
  }

  if (lines[cursor]?.startsWith(">")) {
    const quoteLines: string[] = [];
    while (cursor < lines.length && lines[cursor].startsWith(">")) {
      quoteLines.push(lines[cursor].replace(/^>\s?/, "").trim());
      cursor += 1;
    }
    pullQuote = quoteLines.join(" ").replace(/^["“]|["”]$/g, "").trim();
  }

  while (
    cursor < lines.length &&
    (lines[cursor].trim() === "" || lines[cursor].trim() === "---")
  ) {
    cursor += 1;
  }

  // Drop the markdown Contents section; we render a Terms-style TOC instead.
  if (lines[cursor]?.trim() === "## Contents") {
    cursor += 1;
    while (cursor < lines.length) {
      const line = lines[cursor].trim();
      if (line.startsWith("## ") && line !== "## Contents") {
        break;
      }
      cursor += 1;
    }
  }

  while (
    cursor < lines.length &&
    (lines[cursor].trim() === "" || lines[cursor].trim() === "---")
  ) {
    cursor += 1;
  }

  const bodyMarkdown = lines.slice(cursor).join("\n").trim();

  const sections = Array.from(bodyMarkdown.matchAll(/^## (.+)$/gm)).map(
    (match) => {
      const label = match[1].trim();
      return { id: slugifyHeading(label), label };
    },
  );

  return {
    title,
    versionLabel,
    pullQuote,
    sections,
    bodyMarkdown,
  };
}
