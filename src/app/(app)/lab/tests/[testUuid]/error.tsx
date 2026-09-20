"use client";

import { DetailPageNotFound } from "@/features/app-shell/components/page-layout";

export default function LabTestDetailError() {
  return (
    <DetailPageNotFound
      title="Laboratory test unavailable"
      message="This laboratory test could not be loaded."
    />
  );
}
