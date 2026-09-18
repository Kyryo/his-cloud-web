import { UserIdenticon } from "@/components/UserIdenticon";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type CustomerVisitSheetHeaderProps = {
  action: "start" | "close";
  customerName: string;
  identifier?: string | null;
  gender?: string | null;
  ageLabel?: string | null;
  clinicName?: string | null;
};

export function CustomerVisitSheetHeader({
  action,
  customerName,
  identifier,
  gender,
  ageLabel,
  clinicName,
}: CustomerVisitSheetHeaderProps) {
  const meta = [identifier, gender, ageLabel, clinicName]
    .filter(Boolean)
    .join(" · ");

  return (
    <SheetHeader className="space-y-0 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
      <div className="flex items-center gap-3.5">
        <UserIdenticon
          seed={identifier || customerName}
          name={customerName}
          className="size-11 shrink-0 rounded-xl"
          fallbackClassName="text-sm font-semibold"
        />
        <div className="min-w-0">
          <SheetTitle className="text-sm font-medium text-dash-muted">
            {action === "close" ? "Close visit" : "Start visit"}
          </SheetTitle>
          <p className="truncate text-base font-semibold tracking-tight text-brand-navy">
            {customerName}
          </p>
          {meta ? (
            <p className="mt-0.5 truncate text-sm text-dash-muted">{meta}</p>
          ) : null}
        </div>
      </div>
      <SheetDescription className="sr-only">
        {action === "close"
          ? `Close the active visit for ${customerName}`
          : `Start a walk-in visit for ${customerName}`}
      </SheetDescription>
    </SheetHeader>
  );
}
