import { differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame } from "lucide-react";

interface EscalationBadgeProps {
  missingFrom: string;
  status: string;
  escalationLevel?: string;
}

export const EscalationBadge = ({ missingFrom, status, escalationLevel }: EscalationBadgeProps) => {
  if (status !== "missing") return null;

  const hours = differenceInHours(new Date(), new Date(missingFrom));

  if (hours >= 48) {
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <Flame className="h-3 w-3" />
        Critical ({Math.floor(hours / 24)}d+)
      </Badge>
    );
  }

  if (hours >= 24) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Escalated (24h+)
      </Badge>
    );
  }

  return null;
};
