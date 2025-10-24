"use client";

import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import { formatDateTime } from "@/lib/format-message-time";
import { useMemo, useState, useEffect } from "react";

async function fetchUpcomingBookings() {
  const res = await fetch("/api/booking/upcoming", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch upcoming bookings");
  return await res.json();
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
      { key: "createdAt", label: "CREATED AT" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bookings = await fetchUpcomingBookings();
        if (!cancelled)
          setData(
            bookings?.items?.map((b) => ({
              checkInTime: <DateTime dateTimeIso={b.checkInTime} />,
              checkOutTime: <DateTime dateTimeIso={b.checkOutTime} />,
              room: <Room room={b.room} />,
              guest: <ID ulid={b.guest.userId} />,
              createdAt: <DateTime dateTimeIso={b.createdAt} />,
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
        Upcoming Bookings
      </h2>

      <SortTable
        columns={columns}
        data={data}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
