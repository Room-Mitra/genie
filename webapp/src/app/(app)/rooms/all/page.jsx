"use client";

import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import SortTable from "@/components/ui/sort-table";
import { useState, useEffect, useMemo } from "react";

async function fetchRooms() {
  const res = await fetch("/api/rooms", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch rooms");
  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "roomId", label: "ROOM ID" },
      { key: "number", label: "ROOM NUMBER" },
      { key: "type", label: "TYPE" },
      { key: "floor", label: "FLOOR" },
      { key: "description", label: "DESCRIPTION" },
      { key: "createdAt", label: "CREATED AT" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rooms = await fetchRooms();
        if (!cancelled)
          setData(
            rooms?.items?.map((r) => ({
              roomId: <ID ulid={r.roomId} />,
              number: (
                <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-xs text-white dark:bg-indigo-600/20 dark:text-indigo-300">
                  #{r.number}
                </span>
              ),
              type: (
                <span className="text-dark dark:text-gray-200">{r.type}</span>
              ),
              floor: (
                <div className="text-md align-middle text-dark dark:text-gray-200">
                  {r.floor}
                </div>
              ),
              description: r.description,
              createdAt: <DateTime dateTimeIso={r.createdAt} />,
            })),
          );
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Rooms
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
        noDataMessage="No rooms available"
        loading={loading}
      />
    </div>
  );
}
