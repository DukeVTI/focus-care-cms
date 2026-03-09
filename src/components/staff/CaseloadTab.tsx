import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";

interface YoungPersonSummary {
  id: string;
  first_name: string;
  last_name: string;
  age?: number;
  known_risks?: string[];
}

interface StaffCaseload {
  id: string;
  full_name: string;
  team?: string;
  young_people: YoungPersonSummary[];
  open_tasks: number;
  active_missing: number;
  high_risk_count: number;
}

interface CaseloadTabProps {
  caseloads: StaffCaseload[];
  maxCaseload: number;
}

export const CaseloadTab = ({ caseloads, maxCaseload }: CaseloadTabProps) => {
  const navigate = useNavigate();

  const sorted = [...caseloads].sort((a, b) => b.young_people.length - a.young_people.length);

  return (
    <div className="space-y-6">
      {/* Overview bar */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{caseloads.length}</p>
            <p className="text-sm text-muted-foreground">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {caseloads.reduce((acc, s) => acc + s.young_people.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Young People</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {caseloads.reduce((acc, s) => acc + s.open_tasks, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Open Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-destructive">
              {caseloads.reduce((acc, s) => acc + s.active_missing, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Active Missing</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-staff breakdown */}
      <div className="space-y-4">
        {sorted.map((staff) => {
          const load = maxCaseload > 0 ? (staff.young_people.length / maxCaseload) * 100 : 0;
          const loadColor = load > 80 ? "bg-destructive" : load > 50 ? "bg-amber-500" : "bg-emerald-500";
          
          return (
            <Card key={staff.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                      {staff.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{staff.full_name}</CardTitle>
                      {staff.team && <p className="text-xs text-muted-foreground">{staff.team}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{staff.open_tasks} tasks</span>
                    </div>
                    {staff.active_missing > 0 && (
                      <div className="flex items-center gap-1.5 text-destructive">
                        <MapPin className="h-4 w-4" />
                        <span>{staff.active_missing} missing</span>
                      </div>
                    )}
                    {staff.high_risk_count > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{staff.high_risk_count} high risk</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{staff.young_people.length} young people</span>
                    <span>{Math.round(load)}% capacity</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${loadColor}`} style={{ width: `${Math.min(load, 100)}%` }} />
                  </div>
                </div>
              </CardHeader>
              {staff.young_people.length > 0 && (
                <CardContent className="pt-0">
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {staff.young_people.map(yp => (
                      <div
                        key={yp.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate(`/young-people/${yp.id}`)}
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                          {yp.first_name?.[0]}{yp.last_name?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{yp.first_name} {yp.last_name}</p>
                          {yp.age && <p className="text-xs text-muted-foreground">Age {yp.age}</p>}
                        </div>
                        {(yp.known_risks?.length || 0) > 0 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No caseload data available.</p>
        </div>
      )}
    </div>
  );
};
