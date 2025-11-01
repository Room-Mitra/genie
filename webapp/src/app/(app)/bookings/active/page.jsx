"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Dates } from "@/components/ui/dates";
import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
import { useMemo, useState, useEffect } from "react";

async function fetchActiveBookings() {
  const res = await fetch("/api/booking/active", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch active booking");
  }

  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "bookingId", label: "BOOKING ID" },
      { key: "room", label: "ROOM" },
      { key: "guest", label: "GUEST" },
      { key: "dates", label: "DATES" },
      { key: "createdAt", label: "CREATED AT" },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bookings = await fetchActiveBookings();
        if (!cancelled)
          setData(
            bookings?.items?.map((b) => ({
              bookingId: <ID ulid={b.bookingId} size="xs" />,
              dates: (
                <Dates
                  checkInTime={b.checkInTime}
                  checkOutTime={b.checkOutTime}
                />
              ),
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
      <Breadcrumb pageName="Active Bookings" parent="Bookings" />
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark sm:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No active bookings"
          loading={loading}
        />
      </div>
    </div>
  );
}
