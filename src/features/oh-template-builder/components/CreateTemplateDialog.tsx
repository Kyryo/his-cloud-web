"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { ROUTES } from "@/constants/routes";
import { useBuilderAction } from "@/features/oh-template-builder/hooks/useBuilderAction";
import { getTemplateAdapter } from "@/features/oh-template-builder/lib/templateAdapters";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import {
  TEMPLATE_KIND_META,
  templateQueryKeys,
} from "@/features/oh-template-builder/lib/templateKinds";
import {
  templateFormSchema,
  type TemplateFormInput,
  type TemplateFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import type { TemplateKind } from "@/features/oh-template-builder/template-builder.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type CreateTemplateDialogProps = {
  kind: TemplateKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateTemplateDialog({ kind, open, onOpenChange }: CreateTemplateDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meta = TEMPLATE_KIND_META[kind];
  const { perform, isPending } = useBuilderAction();
  const form = useForm<TemplateFormInput, unknown, TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { name: "", code: "" },
  });
  const isSaving = isPending("template:create");

  async function onSubmit(values: TemplateFormValues) {
    const created = await perform(
      "template:create",
      () => getTemplateAdapter(kind).createTemplate(values),
      { error: "Could not create template" },
    );
    if (!created) {
      return;
    }
    void queryClient.invalidateQueries({ queryKey: templateQueryKeys.list(kind) });
    router.push(ROUTES.ohTemplateBuilder(kind, created.uuid));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(appFont.className, "max-w-md")}>
        <DialogHeader className="text-left">
          <DialogTitle>New {meta.label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Name it now. You will add sections in the builder next.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) => void onSubmit(values))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <RequiredFieldMarker />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoFocus
                      placeholder={meta.namePlaceholder}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!form.getFieldState("code").isDirty) {
                          form.setValue("code", toUpperCode(event.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Code <RequiredFieldMarker />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={meta.codePlaceholder}
                      className="font-mono text-[13px]"
                      onChange={(event) =>
                        form.setValue("code", event.target.value, { shouldDirty: true })
                      }
                    />
                  </FormControl>
                  <FormDescription>Filled in from the name. Fixed after creation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-2">
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? "Creating" : "Create and open"}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
