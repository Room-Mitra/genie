"use client";

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
      { key: "number", label: "ROOM NUMBER" },
      { key: "type", label: "TYPE" },
      { key: "floor", label: "FLOOR" },
      { key: "description", label: "DESCRIPTION" },
      { key: "roomId", label: "ROOM ID" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rooms = await fetchRooms();
        if (!cancelled) setData(rooms?.items);
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
        loading={loading}
        noDataMessage="No rooms available"
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
