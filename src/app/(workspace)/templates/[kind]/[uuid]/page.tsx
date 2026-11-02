import { notFound } from "next/navigation";

import { isTemplateKind } from "@/features/oh-template-builder/lib/templateKinds";
import { TemplateBuilderPage } from "@/features/oh-template-builder/pages/TemplateBuilderPage";

type PageProps = {
  params: Promise<{ kind: string; uuid: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const [{ kind, uuid }, { view }] = await Promise.all([params, searchParams]);
  if (!isTemplateKind(kind)) {
    notFound();
  }
  return (
    <TemplateBuilderPage
      kind={kind}
      templateUuid={uuid}
      view={view === "preview" ? "preview" : "edit"}
    />
  );
}
