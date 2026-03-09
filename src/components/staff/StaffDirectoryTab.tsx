import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Phone, Users } from "lucide-react";

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  team?: string;
  avatar_url?: string;
  availability_status?: string;
  availability_note?: string;
  roles: string[];
  caseload_count: number;
}

interface StaffDirectoryTabProps {
  staff: StaffMember[];
  isAdmin: boolean;
  onUpdateAvailability: (userId: string, status: string, note: string) => void;
}

const availabilityColors: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400",
  busy: "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400",
  on_leave: "bg-sky-500/15 text-sky-700 border-sky-200 dark:text-sky-400",
  off_shift: "bg-muted text-muted-foreground border-border",
};

const availabilityLabels: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  on_leave: "On Leave",
  off_shift: "Off Shift",
};

export const StaffDirectoryTab = ({ staff, isAdmin, onUpdateAvailability }: StaffDirectoryTabProps) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const teams = [...new Set(staff.map(s => s.team).filter(Boolean))] as string[];

  const filtered = staff.filter(s => {
    const matchesSearch = !search || 
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || s.roles.includes(roleFilter);
    const matchesTeam = teamFilter === "all" || s.team === teamFilter;
    return matchesSearch && matchesRole && matchesTeam;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="keyworker">Keyworker</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
        {teams.length > 0 && (
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member) => (
          <Card key={member.id} className="transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  {member.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{member.full_name || "Unknown"}</h3>
                  {member.job_title && (
                    <p className="text-sm text-muted-foreground">{member.job_title}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {member.roles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs capitalize">
                        {role}
                      </Badge>
                    ))}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${availabilityColors[member.availability_status || "available"]}`}
                    >
                      {availabilityLabels[member.availability_status || "available"]}
                    </Badge>
                  </div>
                  {member.availability_note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">"{member.availability_note}"</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t space-y-1.5">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{member.caseload_count} young {member.caseload_count === 1 ? "person" : "people"}</span>
                </div>
                {member.team && (
                  <p className="text-xs text-muted-foreground">Team: {member.team}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No staff members found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
