"use client";

import Link from "next/link";
import { FileWarning, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AddSectionSheet,
  type AddSectionTab,
} from "@/features/oh-template-builder/components/AddSectionSheet";
import { EmptyTemplate } from "@/features/oh-template-builder/components/EmptyTemplate";
import type { SectionInteractionMode } from "@/features/oh-template-builder/components/SelectionModeToggle";
import { TemplateCanvas } from "@/features/oh-template-builder/components/TemplateCanvas";
import { TemplateInspector } from "@/features/oh-template-builder/components/TemplateInspector";
import { TemplateOutline } from "@/features/oh-template-builder/components/TemplateOutline";
import { TemplatePreview } from "@/features/oh-template-builder/components/TemplatePreview";
import {
  TemplateBuilderTopBar,
  type BuilderMode,
} from "@/features/oh-template-builder/components/TemplateBuilderTopBar";
import {
  TemplateBuilderProvider,
  useTemplateBuilder,
} from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import {
  TEMPLATE_KIND_META,
  templateGalleryHref,
} from "@/features/oh-template-builder/lib/templateKinds";
import type { TemplateKind } from "@/features/oh-template-builder/template-builder.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { appFont } from "@/lib/fonts";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

type TemplateBuilderPageProps = {
  kind: TemplateKind;
  templateUuid: string;
  view: BuilderMode;
};

export function TemplateBuilderPage({ kind, templateUuid, view }: TemplateBuilderPageProps) {
  const { userData } = useUser();

  if (!userData?.is_admin) {
    return (
      <CenteredState>
        <EmptyState
          icon={ShieldAlert}
          title="Administrator access required"
          description="Only tenant administrators can edit occupational health templates."
          action={<BackButton kind={kind} />}
        />
      </CenteredState>
    );
  }

  return (
    <TemplateBuilderProvider kind={kind} templateUuid={templateUuid}>
      <BuilderWorkspace view={view} />
    </TemplateBuilderProvider>
  );
}

type AddSectionRequest = {
  tab: AddSectionTab;
  interaction?: SectionInteractionMode;
};

function BuilderWorkspace({ view }: { view: BuilderMode }) {
  const { kind, loadError, selection, select, attachments, isLoading } = useTemplateBuilder();
  const isMobile = useIsMobile();
  const [addSection, setAddSection] = useState<AddSectionRequest | null>(null);
  const isEditing = view === "edit";
  const showColumns = isLoading || attachments.length > 0;

  if (loadError) {
    return (
      <CenteredState>
        <EmptyState
          icon={FileWarning}
          title="This template could not be opened"
          description={getErrorMessage(
            loadError,
            "It may have been archived or you may no longer have access.",
          )}
          action={<BackButton kind={kind} />}
        />
      </CenteredState>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        if (
          event.key === "Escape" &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
        ) {
          select({ type: "template" });
        }
      }}
    >
      <TemplateBuilderTopBar view={view} />

      {isEditing && showColumns ? (
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[256px_minmax(0,1fr)_360px]">
          <aside className="hidden min-h-0 lg:block">
            <TemplateOutline onAddSection={() => setAddSection({ tab: "library" })} />
          </aside>
          <main className="min-h-0">
            <TemplateCanvas onAddSection={(tab) => setAddSection({ tab })} />
          </main>
          <aside className="hidden min-h-0 border-l border-dash-border bg-white md:block">
            <TemplateInspector />
          </aside>
        </div>
      ) : isEditing ? (
        <EmptyTemplate onAddSection={setAddSection} />
      ) : (
        <main className="min-h-0 flex-1">
          <TemplatePreview />
        </main>
      )}

      {isEditing && isMobile ? (
        <Sheet
          open={selection.type !== "template"}
          onOpenChange={(open) => {
            if (!open) {
              select({ type: "template" });
            }
          }}
        >
          <SheetContent
            side="bottom"
            className={cn(appFont.className, "h-[85dvh] rounded-t-2xl p-0")}
          >
            <SheetTitle className="sr-only">Edit selection</SheetTitle>
            <SheetDescription className="sr-only">
              Edit the selected section or item.
            </SheetDescription>
            <TemplateInspector />
          </SheetContent>
        </Sheet>
      ) : null}

      {addSection ? (
        <AddSectionSheet
          open
          initialTab={addSection.tab}
          initialInteraction={addSection.interaction}
          onOpenChange={(open) => {
            if (!open) {
              setAddSection(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center bg-dash-canvas px-6">
      <div className="w-full max-w-md rounded-2xl border border-dash-border bg-white">
        {children}
      </div>
    </div>
  );
}

function BackButton({ kind }: { kind: TemplateKind }) {
  return (
    <SecondaryButton asChild>
      <Link href={templateGalleryHref(kind)}>
        Back to {TEMPLATE_KIND_META[kind].pluralLabel.toLowerCase()}
      </Link>
    </SecondaryButton>
  );
}
