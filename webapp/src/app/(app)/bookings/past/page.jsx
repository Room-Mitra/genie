"use client";

import SortTable from "@/components/ui/sort-table";
import { formatDateTime } from "@/lib/format-message-time";
import { useMemo, useState, useEffect } from "react";

async function fetchPastBookings() {
  const res = await fetch("/api/booking/past", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch past bookings");
  return await res.json();
}

function Room({ room }) {
  return (
    <>
      <div className="flex flex-col items-center gap-2 md:flex-row">
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-xs text-white dark:bg-indigo-600/20 dark:text-indigo-300">
            #{room.number}
          </span>
          <span className="text-dark dark:text-gray-200">{room.type}</span>
        </div>
        <div className="text-md align-middle text-dark dark:text-gray-200">
          Floor: {room.floor}
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "checkInTime", label: "CHECK IN" },
      { key: "checkOutTime", label: "CHECK OUT" },
      { key: "room", label: "ROOM" },
      { key: "guest", label: "GUEST ID" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bookings = await fetchPastBookings();
        if (!cancelled)
          setData(
            bookings?.items?.map((b) => ({
              checkInTime: formatDateTime(b.checkInTime),
              checkOutTime: formatDateTime(b.checkOutTime),
              room: <Room room={b.room} />,
              guest: (
                <span className="text-md text-gray-500">
                  {b.guest.userId.slice(0, 8)}
                </span>
              ),
            })),
          );
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Past Bookings
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
