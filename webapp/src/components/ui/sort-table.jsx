"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react"; // optional, for icons
import { DateTime } from "./datetime";
import { ID } from "./id";
import { Room } from "./room";
import { Spinner } from "@material-tailwind/react";
import { Roles } from "./roles";

const isDateTime = (e) => React.isValidElement(e) && e.type === DateTime;
const isID = (e) => React.isValidElement(e) && e.type == ID;
const isRoom = (e) => React.isValidElement(e) && e.type == Room;
const isRoles = (e) => React.isValidElement(e) && e.type == Roles;
const isDivOrSpan = (e) =>
  (React.isValidElement(e) && e.type === "div") || e.type === "span";

const getValue = (e) => {
  if (isDateTime(e)) return e.props.dateTimeIso;
  if (isID(e)) return e.props.ulid;
  if (isRoom(e)) return e.props.room?.number;
  if (isRoles(e)) return e.props.roles?.join(",");
  if (isDivOrSpan(e)) return e.props.children;

  return e;
};

export default function SortTable({
  columns,
  data = [],
  tableClassNames = [],
  tableHeaderClassNames = [],
  tableHeadClassNames = [],
  tableCellClassNames = [],
  tableRowClassNames = [],
  tableBodyClassNames = [],
  noDataMessage = "No rows",
  loading = false,
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
        const aValue = getValue(a[sortConfig.key]);
        const bValue = getValue(b[sortConfig.key]);
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
              {columns.map((col) => (
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
      {loading && (
        <div className="mx-auto mt-5 w-fit p-4">
          <Spinner />
        </div>
      )}
      {!loading && !sortedRows.length && (
        <div className="mx-auto mt-5 w-fit p-4">
          {noDataMessage || "No rows"}
        </div>
      )}
    </div>
  );
}
