import { format, differenceInHours } from "date-fns";
import { AlertTriangle, Clock, FileCheck, Shield, UserCheck, Radio } from "lucide-react";
import { MISSING_EPISODE_STATUSES } from "@/lib/constants";

interface EpisodeTimelineProps {
  episode: any;
}

const timelineSteps = [
  { key: "reported", label: "Reported Missing", icon: AlertTriangle },
  { key: "escalated", label: "Escalated", icon: Radio },
  { key: "returned", label: "Returned", icon: UserCheck },
  { key: "interview", label: "Return Interview", icon: FileCheck },
  { key: "approved", label: "Manager Approved", icon: Shield },
];

export const EpisodeTimeline = ({ episode }: EpisodeTimelineProps) => {
  const getStepStatus = (key: string) => {
    switch (key) {
      case "reported":
        return episode.missing_from ? "completed" : "pending";
      case "escalated":
        return episode.escalated_at ? "completed" : episode.status?.toLowerCase() === MISSING_EPISODE_STATUSES.MISSING.toLowerCase() ? "active" : "skipped";
      case "returned":
        return episode.returned_at ? "completed" : episode.status?.toLowerCase() === MISSING_EPISODE_STATUSES.MISSING.toLowerCase() ? "active" : "pending";
      case "interview":
        return episode.return_interview_completed ? "completed" : episode.returned_at ? "active" : "pending";
      case "approved":
        return episode.manager_approved ? "completed" : episode.return_interview_completed ? "active" : "pending";
      default:
        return "pending";
    }
  };

  const getStepDate = (key: string) => {
    switch (key) {
      case "reported":
        return episode.missing_from ? format(new Date(episode.missing_from), "dd MMM yyyy HH:mm") : null;
      case "escalated":
        return episode.escalated_at ? format(new Date(episode.escalated_at), "dd MMM yyyy HH:mm") : null;
      case "returned":
        return episode.returned_at ? format(new Date(episode.returned_at), "dd MMM yyyy HH:mm") : null;
      case "interview":
        return episode.return_interview_date ? format(new Date(episode.return_interview_date), "dd MMM yyyy HH:mm") : null;
      case "approved":
        return episode.manager_approved_at ? format(new Date(episode.manager_approved_at), "dd MMM yyyy HH:mm") : null;
      default:
        return null;
    }
  };

  const getDuration = () => {
    if (!episode.missing_from) return null;
    const start = new Date(episode.missing_from);
    const end = episode.returned_at ? new Date(episode.returned_at) : new Date();
    const hours = differenceInHours(end, start);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const rem = hours % 24;
      return `${days}d ${rem}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="relative">
      {/* Duration badge */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Total duration: <span className="font-semibold text-foreground">{getDuration()}</span>
        </span>
      </div>

      <div className="flex items-start gap-0">
        {timelineSteps.map((step, index) => {
          const status = getStepStatus(step.key);
          const date = getStepDate(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex-1 relative">
              {/* Connector line */}
              {index < timelineSteps.length - 1 && (
                <div
                  className={`absolute top-4 left-[calc(50%+16px)] right-0 h-0.5 ${
                    status === "completed" ? "bg-primary" : "bg-border"
                  }`}
                />
              )}

              <div className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    status === "completed"
                      ? "bg-primary border-primary text-primary-foreground"
                      : status === "active"
                      ? "bg-background border-primary text-primary animate-pulse"
                      : status === "skipped"
                      ? "bg-muted border-muted-foreground/30 text-muted-foreground"
                      : "bg-background border-border text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-xs mt-1.5 font-medium ${
                  status === "completed" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
                {date && (
                  <span className="text-[10px] text-muted-foreground mt-0.5">{date}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
