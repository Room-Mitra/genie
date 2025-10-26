"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
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
      { key: "bookingId", label: "BOOKING ID" },
      { key: "checkInTime", label: "CHECK IN" },
      { key: "checkOutTime", label: "CHECK OUT" },
      { key: "room", label: "ROOM" },
      { key: "guest", label: "GUEST" },
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
              bookingId: <ID ulid={b.bookingId} />,
              checkInTime: <DateTime dateTimeIso={b.checkInTime} />,
              checkOutTime: <DateTime dateTimeIso={b.checkOutTime} />,
              room: <Room room={b.room} />,
              guest: (
                <User user={b.guest} showMobileNumber={true} width="w-50" />
              ),
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
    <div>
      <Breadcrumb pageName="Upcoming Bookings" parent="Bookings" />
      <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No upcoming bookings"
          loading={loading}
        />
      </div>
    </div>
  );
}
