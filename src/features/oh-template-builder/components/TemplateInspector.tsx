"use client";

import { Archive, FileStack, MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";

import { ConfirmActionButton } from "@/features/oh-template-builder/components/ConfirmActionButton";
import { InspectorShell } from "@/features/oh-template-builder/components/InspectorShell";
import { ItemInspector } from "@/features/oh-template-builder/components/ItemInspector";
import { SectionInspector } from "@/features/oh-template-builder/components/SectionInspector";
import {
  useSectionItems,
  useTemplateBuilder,
} from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import {
  TEMPLATE_KIND_META,
  templateGalleryHref,
} from "@/features/oh-template-builder/lib/templateKinds";

export function TemplateInspector() {
  const { selection, attachments } = useTemplateBuilder();
  const attachment =
    selection.type === "template"
      ? undefined
      : attachments.find((row) => row.uuid === selection.attachmentUuid);
  const itemsQuery = useSectionItems(
    selection.type === "item" ? attachment?.sectionUuid : null,
  );

  if (!attachment || selection.type === "template") {
    return <TemplateDetailsPanel />;
  }

  if (selection.type === "section") {
    if (!attachment.section) {
      return <TemplateDetailsPanel />;
    }
    return (
      <SectionInspector
        key={attachment.uuid}
        attachment={attachment}
        section={attachment.section}
      />
    );
  }

  const item = itemsQuery.data?.items.find((row) => row.uuid === selection.itemUuid);
  if (!item) {
    return <TemplateDetailsPanel />;
  }
  return <ItemInspector key={item.uuid} attachment={attachment} item={item} />;
}

function TemplateDetailsPanel() {
  const router = useRouter();
  const { kind, template, attachments, archiveTemplate, isPending } =
    useTemplateBuilder();
  const meta = TEMPLATE_KIND_META[kind];
  const requiredCount = attachments.filter((row) => row.section?.isMandatory).length;
  const itemCount = attachments.reduce((sum, row) => sum + (row.itemCount ?? 0), 0);

  async function onArchive() {
    const archived = await archiveTemplate();
    if (archived) {
      router.push(templateGalleryHref(kind));
    }
  }

  const stats = [
    { label: "Sections", value: attachments.length },
    { label: "Required", value: requiredCount },
    { label: "Items", value: itemCount },
  ];

  return (
    <InspectorShell
      eyebrow={
        <span className="inline-flex items-center gap-1.5">
          <FileStack className="size-3.5" aria-hidden />
          {meta.label}
        </span>
      }
      title={template?.name ?? ""}
      footer={
        <ConfirmActionButton
          confirmLabel="Archive template"
          disabled={isPending("template:archive")}
          onConfirm={onArchive}
        >
          <Archive className="size-3.5" aria-hidden />
          Archive template
        </ConfirmActionButton>
      }
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-slate-50 px-3 py-3">
              <dt className="text-xs text-dash-muted">{stat.label}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-brand-navy">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-1.5">
          <p className="text-xs text-dash-muted">Code</p>
          <p className="font-mono text-[13px] text-brand-navy">{template?.code}</p>
        </div>

        <div className="flex gap-3 rounded-xl border border-dashed border-dash-border px-4 py-4">
          <MousePointerClick className="mt-0.5 size-4 shrink-0 text-brand-primary" aria-hidden />
          <p className="text-[13px] leading-5 text-brand-slate">
            Select a section or item on the canvas to edit it here. Rename the
            template from the top bar.
          </p>
        </div>

        <p className="text-xs leading-5 text-dash-muted">{meta.description}</p>
      </div>
    </InspectorShell>
  );
}
