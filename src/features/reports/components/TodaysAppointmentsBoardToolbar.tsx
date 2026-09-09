import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BoardGroupBy } from "@/features/reports/utils/todays-appointments-board";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const GROUP_OPTIONS: Array<{ id: BoardGroupBy; label: string }> = [
  { id: "time", label: "Time" },
  { id: "provider", label: "Provider" },
  { id: "clinic", label: "Clinic" },
];

type ClinicOption = {
  uuid: string;
  name: string;
};

type TodaysAppointmentsBoardToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  groupBy: BoardGroupBy;
  onGroupByChange: (groupBy: BoardGroupBy) => void;
  clinicUuid: string;
  onClinicChange: (clinicUuid: string) => void;
  clinics: ClinicOption[];
  isClinicsLoading?: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function TodaysAppointmentsBoardToolbar({
  search,
  onSearchChange,
  groupBy,
  onGroupByChange,
  clinicUuid,
  onClinicChange,
  clinics,
  isClinicsLoading = false,
  onRefresh,
  isRefreshing = false,
}: TodaysAppointmentsBoardToolbarProps) {
  return (
    <div
      className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      data-testid="todays-appointments-toolbar"
    >
      <h1 className="sr-only">{"Today's appointments"}</h1>
      <div className="relative w-full lg:max-w-md">
        <AppIcon
          name="search"
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dash-muted"
        />
        <Input
          type="search"
          value={search}
          placeholder="Find a client or provider"
          className="h-9 rounded-lg border-dash-border bg-transparent pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          data-testid="todays-appointments-search"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {clinics.length > 0 ? (
          <Select
            value={clinicUuid}
            onValueChange={onClinicChange}
            disabled={isClinicsLoading}
          >
            <SelectTrigger
              className="h-9 w-[180px] rounded-lg border-dash-border bg-transparent"
              aria-label="Clinic"
            >
              <SelectValue placeholder="All clinics" />
            </SelectTrigger>
            <SelectContent className={cn(appFont.className, "max-h-72")}>
              <SelectItem value="all">All clinics</SelectItem>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.uuid} value={clinic.uuid}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <div
          className="flex h-9 items-center gap-0.5 rounded-lg border border-dash-border/80 p-0.5"
          role="group"
          aria-label="Group appointments"
        >
          {GROUP_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={groupBy === option.id}
              onClick={() => onGroupByChange(option.id)}
              className={cn(
                "h-8 rounded-md px-2.5 text-[13px] font-medium text-dash-muted transition-colors hover:text-brand-navy",
                groupBy === option.id && "bg-dash-canvas text-brand-navy",
              )}
              data-testid={`todays-appointments-group-${option.id}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-brand-slate"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
