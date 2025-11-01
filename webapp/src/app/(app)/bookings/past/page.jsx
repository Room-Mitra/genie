"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Dates } from "@/components/ui/dates";
import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
import { useMemo, useState, useEffect } from "react";

async function fetchPastBookings() {
  const res = await fetch("/api/booking/past", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch past bookings");
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
        const bookings = await fetchPastBookings();
        if (!cancelled)
          setData(
            bookings?.items?.map((b) => ({
              bookingId: <ID size="xs" ulid={b.bookingId} />,
              dates: (
                <Dates
                  checkInTime={b.checkInTime}
                  checkOutTime={b.checkOutTime}
                />
              ),
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
      <Breadcrumb pageName="Past Bookings" parent="Bookings" />
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark sm:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage={"No past bookings"}
          loading={loading}
        />
      </div>
    </div>
  );
}
