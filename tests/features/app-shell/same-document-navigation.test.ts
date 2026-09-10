import { describe, expect, it } from "vitest";

import { getSameDocumentNavigationHref } from "@/features/app-shell/utils/same-document-navigation";

describe("getSameDocumentNavigationHref", () => {
  it("returns the path for a same-origin link", () => {
    const link = document.createElement("a");
    link.href = "/appointments/board";
    document.body.append(link);

    expect(getSameDocumentNavigationHref(link)).toBe("/appointments/board");
    link.remove();
  });

  it("ignores new-tab and hash links", () => {
    const external = document.createElement("a");
    external.href = "/appointments";
    external.target = "_blank";

    const hash = document.createElement("a");
    hash.href = "#agenda";

    expect(getSameDocumentNavigationHref(external)).toBeNull();
    expect(getSameDocumentNavigationHref(hash)).toBeNull();
  });
});
