"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  sessionActivitySchema,
  type SessionActivityFormValues,
} from "@/features/therapy/schemas/session-activity.schema";
import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import {
  createTherapyVisitSessionActivity,
  updateTherapyVisitSessionActivity,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyPerformanceNoteOption,
  TherapySessionActivity,
  TherapySessionOption,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

function emptyValues(
  sessionOptions: TherapySessionOption[],
): SessionActivityFormValues {
  return {
    session_uuid: sessionOptions.length === 1 ? sessionOptions[0].uuid : "",
    name: "",
    category: "",
    description: "",
    instructions: "",
    precautions: "",
    sets: null,
    reps: null,
    duration_seconds: null,
    resistance_or_level: "",
    cues_provided: "",
    performance_notes: "",
    is_home_program: false,
  };
}

function valuesFromActivity(
  activity: TherapySessionActivity | null,
  sessionOptions: TherapySessionOption[],
): SessionActivityFormValues {
  if (!activity) return emptyValues(sessionOptions);
  return {
    session_uuid: activity.session_uuid,
    name: activity.name,
    category: activity.category,
    description: activity.description,
    instructions: activity.instructions,
    precautions: activity.precautions,
    sets: activity.sets,
    reps: activity.reps,
    duration_seconds: activity.duration_seconds,
    resistance_or_level: activity.resistance_or_level,
    cues_provided: activity.cues_provided,
    performance_notes: activity.performance_notes,
    is_home_program: activity.is_home_program,
  };
}

export function SessionActivityForm({
  discipline,
  visitUuid,
  activity,
  sessionOptions,
  performanceNoteOptions,
  onCancel,
  onSaved,
}: {
  discipline: TherapyDiscipline;
  visitUuid: string;
  activity: TherapySessionActivity | null;
  sessionOptions: TherapySessionOption[];
  performanceNoteOptions: TherapyPerformanceNoteOption[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(Boolean(activity));
  const form = useForm<SessionActivityFormValues>({
    resolver: zodResolver(sessionActivitySchema),
    defaultValues: valuesFromActivity(activity, sessionOptions),
  });

  async function submit(values: SessionActivityFormValues) {
    try {
      if (activity) {
        await updateTherapyVisitSessionActivity(
          discipline,
          visitUuid,
          activity.uuid,
          values,
        );
      } else {
        await createTherapyVisitSessionActivity(discipline, visitUuid, values);
      }
      await onSaved();
      toast({
        variant: "success",
        title: activity ? "Activity updated" : "Activity added",
        description: "The session activity has been saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save activity",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="pb-28" onSubmit={form.handleSubmit(submit)}>
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-3 mb-2"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to activities
            </Button>
            <h2 className="text-xl font-semibold text-brand-navy">
              {activity ? "Edit activity" : "New activity"}
            </h2>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {sessionOptions.length > 1 ? (
            <FormField
              control={form.control}
              name="session_uuid"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Therapy session</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessionOptions.map((session) => (
                        <SelectItem key={session.uuid} value={session.uuid}>
                          Session {session.session_number} - {session.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          {(["name", "category"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{name}</FormLabel>
                  <FormControl><Input disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          {(["description", "instructions"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{name}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Collapsible open={showMore} onOpenChange={setShowMore} className="mt-5">
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" className="-ml-3">
              <Settings className="size-4" aria-hidden="true" />
              {showMore ? "Hide more inputs" : "Show more options"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4 border-t border-brand-border pt-5">
            <FormField
              control={form.control}
              name="precautions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precautions</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                ["sets", "Sets"],
                ["reps", "Repetitions"],
                ["duration_seconds", "Duration (seconds)"],
              ] as const).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value
                                ? event.target.valueAsNumber
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            {([
              ["resistance_or_level", "Resistance or level"],
              ["cues_provided", "Cues provided"],
            ] as const).map(([name, label]) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="performance_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance notes</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select performance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {performanceNoteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        <TherapyFormActionBar
          isSubmitting={isSubmitting}
          message={
            activity ? "Unsaved activity changes" : "New activity not yet saved"
          }
          saveLabel={activity ? "Save changes" : "Save activity"}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
