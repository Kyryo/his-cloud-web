import { notFound } from "next/navigation";

import { isTemplateKind } from "@/features/oh-template-builder/lib/templateKinds";
import { TemplateBuilderPage } from "@/features/oh-template-builder/pages/TemplateBuilderPage";

type PageProps = {
  params: Promise<{ kind: string; uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { kind, uuid } = await params;
  if (!isTemplateKind(kind)) {
    notFound();
  }
  return <TemplateBuilderPage kind={kind} templateUuid={uuid} />;
}
