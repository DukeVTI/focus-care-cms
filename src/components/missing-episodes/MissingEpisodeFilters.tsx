import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MissingEpisodeFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const MissingEpisodeFilters = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
}: MissingEpisodeFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Input
        placeholder="Search by name or case ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Episodes</SelectItem>
          <SelectItem value="missing">Currently Missing</SelectItem>
          <SelectItem value="returned">Returned</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
