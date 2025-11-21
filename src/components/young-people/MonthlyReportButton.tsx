import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateMonthlyReport } from "@/utils/monthlyReportGenerator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";

interface MonthlyReportButtonProps {
  youngPersonId: string;
}

export const MonthlyReportButton = ({ youngPersonId }: MonthlyReportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyReport(youngPersonId, dateFrom, dateTo);
      toast({
        title: "Success",
        description: "Monthly report generated successfully",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {format(dateFrom, "dd MMM")} - {format(dateTo, "dd MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <CalendarComponent
                mode="single"
                selected={dateFrom}
                onSelect={(date) => date && setDateFrom(date)}
                disabled={(date) => date > dateTo}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <CalendarComponent
                mode="single"
                selected={dateTo}
                onSelect={(date) => date && setDateTo(date)}
                disabled={(date) => date < dateFrom || date > new Date()}
              />
            </div>
            <Button
              onClick={() => setShowCalendar(false)}
              className="w-full"
              size="sm"
            >
              Apply Date Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        size="sm"
      >
        <FileText className="h-4 w-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate Monthly Report"}
      </Button>
    </div>
  );
};
