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
import { Department } from "./department";
import { Dates } from "./dates";
import User from "./user";
import RequestStatus from "@/app/(app)/requests/_components/requestStatus";

const isDateTime = (e) => React.isValidElement(e) && e.type === DateTime;
const isID = (e) => React.isValidElement(e) && e.type === ID;
const isRoom = (e) => React.isValidElement(e) && e.type === Room;
const isRoles = (e) => React.isValidElement(e) && e.type === Roles;
const isDepartment = (e) => React.isValidElement(e) && e.type === Department;
const isDates = (e) => React.isValidElement(e) && e.type === Dates;
const isStaff = (e) => React.isValidElement(e) && e.type === User;
const isRequestStatus = (e) =>
  React.isValidElement(e) && e.type === RequestStatus;
const isDivOrSpan = (e) =>
  (React.isValidElement(e) && e.type === "div") || e.type === "span";

const getValue = (e) => {
  if (isDateTime(e)) return e.props.dateTimeIso;
  if (isID(e)) return e.props.ulid;
  if (isRoom(e)) return e.props.room?.number;
  if (isRoles(e)) return e.props.roles?.join(",");
  if (isDepartment(e)) return e.props.department;
  if (isDates(e)) return e.props.estimatedTimeOfFulfillment;
  if (isStaff(e))
    return `${e.props?.user?.firstName} ${e.props?.user?.lastName}`.toUpperCase();
  if (isRequestStatus(e)) return `${e.props.status}`;
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
  onClickPrevPage = () => {},
  onClickNextPage = () => {},
  loading = false,
  hasMore = false,
  isAtStart = true,
  showPagination = false,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [prevDisabled, setPrevDisabled] = useState(isAtStart);
  const [nextDisabled, setNextDisabled] = useState(!hasMore);

  useEffect(() => {
    setPrevDisabled(isAtStart);
    setNextDisabled(!hasMore);
  }, [hasMore, isAtStart]);

  const [rows, setRows] = useState(data);
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    setRows(Array.isArray(data) ? data : []);
  }, [data]);

  useEffect(() => {
    if (!rows) {
      setSortedRows([]);
      return;
    }
    if (!sortConfig.key) {
      setSortedRows(rows);
      return;
    }
    const sorted = [...rows].sort((a, b) => {
      const aValue = getValue(a[sortConfig.key]);
      const bValue = getValue(b[sortConfig.key]);
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    setSortedRows(sorted);
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

  const keyFromRow = (row, fallbackIdx) => {
    // If you have an <ID ulid="..."/> cell, use it:
    const idCell = row.id ?? row.ID ?? row.ulid ?? null;
    if (isID(idCell)) return idCell.props.ulid;
    // or extract from any column that carries your requestId
    const maybe = Object.values(row).find((cell) => isID(cell));
    if (maybe) return maybe.props.ulid;
    return fallbackIdx;
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
                <div className="mx-auto flex w-fit items-center gap-1">
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
              key={keyFromRow(row, idx)}
              className={cn(
                "border-b transition-colors ...",
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
                  <div className="mx-auto flex w-fit gap-1">{row[col.key]}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30">
          <Spinner />
        </div>
      )}
      {!loading && !sortedRows.length && (
        <div className="mx-auto mt-5 w-fit p-4">
          {noDataMessage || "No rows"}
        </div>
      )}
      {showPagination && (
        <div className="flex h-20 items-center justify-center border-t dark:border-dark-3">
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClickPrevPage}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                prevDisabled
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500",
              )}
              disabled={prevDisabled}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={onClickNextPage}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                nextDisabled
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500",
              )}
              disabled={nextDisabled}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
