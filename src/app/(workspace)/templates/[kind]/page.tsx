import { notFound, redirect } from "next/navigation";

import {
  isTemplateKind,
  templateGalleryHref,
} from "@/features/oh-template-builder/lib/templateKinds";

type PageProps = {
  params: Promise<{ kind: string }>;
};

export default async function Page({ params }: PageProps) {
  const { kind } = await params;
  if (!isTemplateKind(kind)) {
    notFound();
  }
  redirect(templateGalleryHref(kind));
}
