"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react"; // optional, for icons

export default function SortTable({
  columns,
  data = [],
  tableClassNames = [],
  tableHeaderClassNames = [],
  tableHeadClassNames = [],
  tableCellClassNames = [],
  tableRowClassNames = [],
  tableBodyClassNames = [],
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [rows, setRows] = useState(data);
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    setRows(data);
  }, [data]);

  useEffect(() => {
    setSortedRows(
      [...rows].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }),
    );
  }, [sortConfig, rows]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // toggle asc/desc
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", ...tableClassNames)}
      >
        <thead className={cn("[&_tr]:border-b", ...tableHeaderClassNames)}>
          <tr
            className={cn(
              "border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:border-dark-3 dark:hover:bg-dark-2 dark:data-[state=selected]:bg-neutral-800",
              ...tableRowClassNames,
            )}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={cn(
                  "h-12 px-4 text-left align-middle font-medium text-neutral-500 dark:text-neutral-400 [&:has([role=checkbox])]:pr-0",
                  ...tableHeadClassNames,
                )}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col?.sortable !== false && (
                    <ArrowUpDown
                      size={14}
                      className={`transition-transform ${
                        sortConfig.key === col.key
                          ? sortConfig.direction === "asc"
                            ? "rotate-180 text-blue-500"
                            : "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody
          className={cn("[&_tr:last-child]:border-0", ...tableBodyClassNames)}
        >
          {sortedRows.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                "border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100 dark:border-dark-3 dark:hover:bg-dark-2 dark:data-[state=selected]:bg-neutral-800",
                ...tableRowClassNames,
              )}
            >
              {columns.map((col, jdx) => (
                <td
                  key={col.key}
                  className={cn(
                    "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                    ...tableCellClassNames,
                  )}
                >
                  {typeof row[col.key] === "function" ? (
                    <form action={row[col.key]}>
                      <button>{col.label}</button>
                    </form>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
