"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";

const AUTOSAVE_MS = 700;

/**
 * Debounced save while the inspector form is dirty, plus a flush hook so
 * Preview / navigation can wait for pending edits before leaving Build.
 */
export function useInspectorAutosave<TInput extends FieldValues, TOutput extends FieldValues>(
  form: UseFormReturn<TInput, unknown, TOutput>,
  save: (values: TOutput) => Promise<boolean>,
) {
  const { registerPendingSave } = useTemplateBuilder();
  const saveRef = useRef(save);
  const formRef = useRef(form);
  saveRef.current = save;
  formRef.current = form;

  useEffect(() => {
    return registerPendingSave(async () => {
      const current = formRef.current;
      if (!current.formState.isDirty) {
        return true;
      }
      let saved = false;
      await current.handleSubmit(async (values) => {
        saved = await saveRef.current(values);
      })();
      // If validation failed, block navigation only while still dirty.
      return saved || !current.formState.isDirty;
    });
  }, [registerPendingSave]);

  useEffect(() => {
    let timer: number | undefined;

    const runSave = () => {
      void formRef.current.handleSubmit(async (values) => {
        await saveRef.current(values);
      })();
    };

    const subscription = form.watch(() => {
      if (!formRef.current.formState.isDirty) {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(runSave, AUTOSAVE_MS);
    });

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [form]);
}
