import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  waiting: "Waiting",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const variants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  waiting: "secondary",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
};

type OpdEncounterStatusBadgeProps = {
  status: string;
};

export function OpdEncounterStatusBadge({ status }: OpdEncounterStatusBadgeProps) {
  return (
    <Badge variant={variants[status] ?? "secondary"}>
      {labels[status] ?? status.replaceAll("_", " ")}
    </Badge>
  );
}
