import { describe, expect, it } from "vitest";

import {
  parseSalesPlaybookMarkdown,
  readSalesPlaybookMarkdown,
} from "@/features/platform-admin/services/sales-playbook";

describe("sales playbook", () => {
  it("loads the company sales playbook markdown", async () => {
    const markdown = await readSalesPlaybookMarkdown();

    expect(markdown).toContain("Sigma Health Sales Playbook");
    expect(markdown).toContain("We do not sell software. We diagnose problems.");
  });

  it("parses title, quote, toc sections, and body without contents", async () => {
    const markdown = await readSalesPlaybookMarkdown();
    const playbook = parseSalesPlaybookMarkdown(markdown);

    expect(playbook.title).toBe("Sigma Health Sales Playbook");
    expect(playbook.versionLabel).toBe("Version 2.0, Internal Use Only");
    expect(playbook.pullQuote).toBe(
      "We do not sell software. We diagnose problems.",
    );
    expect(playbook.sections[0]).toEqual({ id: "welcome", label: "Welcome" });
    expect(playbook.sections.some((section) => section.label === "Contents")).toBe(
      false,
    );
    expect(playbook.bodyMarkdown).toContain("## Welcome");
    expect(playbook.bodyMarkdown).not.toContain("## Contents");
  });
});
