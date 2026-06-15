"use client";

import { CalendarClock, Clock3, Pencil, Trash2, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TherapySession } from "@/features/therapy/types/therapy.types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", {
  dateStyle: "medium",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : DATE_FORMATTER.format(date);
}

function ClinicalDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </dt>
      <dd
        className="mt-1 whitespace-pre-wrap text-sm leading-6 text-brand-slate [&_em]:italic [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

export function TherapySessionRecord({
  session,
  onEdit,
  onDelete,
  isReadOnly,
}: {
  session: TherapySession;
  onEdit: () => void;
  onDelete: () => void;
  isReadOnly: boolean;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base text-brand-navy">
              Session {session.session_number}
            </CardTitle>
            {session.is_final_session ? (
              <Badge variant="secondary">Final session</Badge>
            ) : null}
            {session.patient_response ? (
              <Badge variant="outline" className="capitalize">
                {session.patient_response}
              </Badge>
            ) : null}
          </div>
          <CardDescription className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              {formatDate(session.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-4" aria-hidden="true" />
              {session.duration_minutes} minutes
            </span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 md:grid-cols-2">
          <ClinicalDetail
            label="Subjective complaint"
            value={session.subjective_complaint}
          />
          <ClinicalDetail
            label="Objective findings"
            value={session.objective_findings}
          />
          <ClinicalDetail
            label="Assessment"
            value={session.assessment_notes}
          />
          <ClinicalDetail
            label="Plan for next session"
            value={session.plan_for_next_session}
          />
        </dl>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-brand-muted">
            {session.created_by_name ? (
              <span className="flex items-center gap-1.5">
                <UserRound className="size-3.5" aria-hidden="true" />
                Recorded by {session.created_by_name}
              </span>
            ) : null}
            <span>Created {formatDate(session.created_at)}</span>
          </div>
          {!isReadOnly ? (
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-slate hover:bg-red-50 hover:text-red-700"
                onClick={onDelete}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
