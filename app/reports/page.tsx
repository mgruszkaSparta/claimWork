"use client";

import { useEffect, useState } from "react";
import {
  getReportMetadata,
  exportReport,
  getFilterValues,
  ReportRequest,
  ReportMetadata,
} from "@/lib/api/reports";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";

export default function ReportsPage() {
  const [metadata, setMetadata] = useState<ReportMetadata>({});
  const [entity, setEntity] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterField, setFilterField] = useState("");
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getReportMetadata().then(setMetadata).catch(console.error);
  }, []);

  const toggleField = (field: string) => {
    setFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  useEffect(() => {
    if (entity && filterField) {
      getFilterValues(entity, filterField)
        .then(setFilterOptions)
        .catch(console.error);
    }
  }, [entity, filterField]);

  const handleExport = async () => {
    const request: ReportRequest = {
      entity,
      fields,
      filters: Object.keys(filters).length ? filters : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };
    const blob = await exportReport(request);
    saveAs(blob, "report.xlsx");
  };

  const entityFields = metadata[entity] || [];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Raporty</h1>
      <div className="w-full md:w-1/3">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger>
            <SelectValue placeholder="Wybierz encję" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(metadata).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {entity && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Pola</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {entityFields.map((f) => (
                <label key={f} className="flex items-center space-x-2">
                  <Checkbox
                    checked={fields.includes(f)}
                    onCheckedChange={() => toggleField(f)}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Filtry</p>
            <div className="flex space-x-2">
              <Select value={filterField} onValueChange={setFilterField}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pole" />
                </SelectTrigger>
                <SelectContent>
                  {entityFields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterField && (
                <Select
                  onValueChange={(value) => {
                    setFilters((prev) => ({ ...prev, [filterField]: value }));
                    setFilterField("");
                    setFilterOptions([]);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Wartość" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {Object.keys(filters).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      )}
      <Button onClick={handleExport} disabled={!entity || fields.length === 0}>
        Eksport do Excel
      </Button>
    </div>
  );
}
