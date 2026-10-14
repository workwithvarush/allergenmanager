"use client";

import { useState } from "react";
import { FilterChips, type FilterChipOption } from "@/components/FilterChips";

type StatusFilter = "all" | "incomplete" | "reprint" | "ready";

const OPTIONS: FilterChipOption<StatusFilter>[] = [
  { value: "all", label: "All", count: 6 },
  { value: "incomplete", label: "Incomplete", count: 2, tone: "danger" },
  { value: "reprint", label: "Reprint", count: 1, tone: "warn" },
  { value: "ready", label: "Ready", count: 3, tone: "ready" },
];

export function FilterChipsDemo() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  return (
    <FilterChips
      label="Filter events by status"
      options={OPTIONS}
      value={filter}
      onChange={setFilter}
      meta="Sorted by service time"
    />
  );
}
