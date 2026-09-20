"use client";

import { DetailPageNotFound } from "@/features/app-shell/components/page-layout";

export default function LabPanelDetailError() {
  return (
    <DetailPageNotFound
      title="Laboratory panel unavailable"
      message="This laboratory panel could not be loaded."
    />
  );
}
