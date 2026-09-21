import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VisitAttachmentDropzone } from "@/features/visits/components/VisitAttachmentDropzone";

afterEach(() => {
  cleanup();
});

describe("VisitAttachmentDropzone", () => {
  it("rejects non-PDF files", () => {
    const onFileChange = vi.fn();
    render(
      <VisitAttachmentDropzone file={null} onFileChange={onFileChange} />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["hello"], "note.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalledWith(null);
    expect(screen.getByTestId("visit-attachment-error")).toHaveTextContent(
      "Only PDF files are allowed.",
    );
  });

  it("accepts a PDF file", () => {
    const onFileChange = vi.fn();
    render(
      <VisitAttachmentDropzone file={null} onFileChange={onFileChange} />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["%PDF"], "note.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("shows the selected file chip", () => {
    const file = new File(["%PDF"], "referral.pdf", { type: "application/pdf" });
    render(
      <VisitAttachmentDropzone file={file} onFileChange={vi.fn()} />,
    );

    expect(screen.getByTestId("visit-attachment-selected")).toHaveTextContent(
      "referral.pdf",
    );
  });
});
