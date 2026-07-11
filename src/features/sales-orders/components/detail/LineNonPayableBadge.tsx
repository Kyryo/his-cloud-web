import { Badge } from "@/components/ui/badge";

export function LineNonPayableBadge() {
  return (
    <Badge
      variant="warning"
      className="shrink-0 font-normal"
      title="Not on the order pricelist — paid by the client"
    >
      Non-payable
    </Badge>
  );
}
