import * as React from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveStatus, LeaveType } from "@/types/leave";

interface MyLeavesToolbarProps {
  statusFilter: LeaveStatus[];
  setStatusFilter: (statuses: LeaveStatus[]) => void;
  typeFilter: LeaveType | "all";
  setTypeFilter: (type: LeaveType | "all") => void;
  dateFilter: DateRange | undefined;
  setDateFilter: (date: DateRange | undefined) => void;
}

const statusOptions: { value: LeaveStatus; label: string }[] = [
  { value: "SUBMITTED", label: "Złożony" },
  { value: "APPROVED", label: "Zatwierdzony" },
  { value: "REJECTED", label: "Odrzucony" },
  { value: "DRAFT", label: "Szkic" },
  { value: "WITHDRAWN", label: "Wycofany" },
];

export function MyLeavesToolbar({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  dateFilter,
  setDateFilter,
}: MyLeavesToolbarProps) {
  const handleStatusToggle = (status: LeaveStatus) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter((s) => s !== status)
      : [...statusFilter, status];
    setStatusFilter(newStatusFilter);
  };

  const isFiltered = statusFilter.length > 0 || typeFilter !== 'all' || !!dateFilter;

  const clearFilters = () => {
    setStatusFilter([]);
    setTypeFilter('all');
    setDateFilter(undefined);
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Status
              {statusFilter.length > 0 && (
                <span className="ml-2 rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {statusFilter.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="start">
            <div className="p-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter.includes(option.value) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleStatusToggle(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as LeaveType | 'all')}>
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Typ urlopu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="Wypoczynkowy">Wypoczynkowy</SelectItem>
            <SelectItem value="Na żądanie">Na żądanie</SelectItem>
            <SelectItem value="Okolicznościowy">Okolicznościowy</SelectItem>
            <SelectItem value="Opieka nad dzieckiem">Opieka nad dzieckiem</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              size="sm"
              className={cn(
                "h-8 w-[260px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter?.from ? (
                dateFilter.to ? (
                  <>
                    {format(dateFilter.from, "LLL dd, y")} -{" "}
                    {format(dateFilter.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateFilter.from, "LLL dd, y")
                )
              ) : (
                <span>Wybierz zakres dat</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateFilter?.from}
              selected={dateFilter}
              onSelect={setDateFilter}
              numberOfMonths={2}
              locale={pl}
            />
          </PopoverContent>
        </Popover>
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
            Wyczyść
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}