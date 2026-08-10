"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import { unsubscribeFromAppointmentsReports } from "@/features/notifications/services/appointments-report-subscription.service";

function UnsubscribeAppointmentsReportsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This unsubscribe link is missing a token.");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setStatus("loading");
        const response = await unsubscribeFromAppointmentsReports({ token });
        if (!cancelled) {
          setStatus("success");
          setMessage(response.message);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "We could not process your unsubscribe request.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-brand-navy">
        Unsubscribe from appointments reports
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        You will no longer receive daily appointments report emails from your
        organization.
      </p>

      <div className="mt-6 space-y-4">
        {status === "loading" ? (
          <p className="text-sm text-brand-muted">Processing your request...</p>
        ) : null}
        {status === "success" ? (
          <StatusBanner
            variant="success"
            message={
              message ??
              "You have been unsubscribed from appointments report emails."
            }
          />
        ) : null}
        {status === "error" ? (
          <StatusBanner
            variant="error"
            message={
              message ?? "We could not process your unsubscribe request."
            }
          />
        ) : null}
      </div>
    </div>
  );
}

export function UnsubscribeAppointmentsReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6">
          <p className="text-sm text-brand-muted">Loading...</p>
        </div>
      }
    >
      <UnsubscribeAppointmentsReportsContent />
    </Suspense>
  );
}
