"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Dates } from "@/components/ui/dates";
import { DateTime } from "@/components/ui/datetime";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import User from "@/components/ui/user";
import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";

const LIMIT = 25;

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Page 0 uses null as the cursor (first page).
  const [cursorStack, setCursorStack] = useState([null]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const isAtStart = cursorIndex === 0;

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

  // Serialize a potentially object-shaped token for the querystring.
  const serializeToken = (token) => {
    if (token == null) return null;
    return typeof token === "string"
      ? token
      : encodeURIComponent(JSON.stringify(token));
  };

  const fetchPageAt = useCallback(
    async ({ index, limit } = {}) => {
      setLoading(true);
      try {
        const tokenForThisPage = cursorStack[index] ?? null;

        const qs = new URLSearchParams();
        if (limit) qs.append("limit", String(limit));
        const qToken = serializeToken(tokenForThisPage);
        if (qToken) qs.append("nextToken", qToken);

        const res = await fetch(`/api/booking/past?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch past bookings");
        }

        const bookings = await res.json();

        setData(
          Array.isArray(bookings?.items)
            ? bookings?.items?.map((b) => ({
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
              }))
            : [],
        );

        const next = bookings?.nextToken ?? null; // raw token for the *next* page
        setHasMore(Boolean(next));
        setCursorIndex(index);

        setCursorStack((prev) => {
          const copy = prev.slice(0, index + 1); // drop any forward history
          copy[index + 1] = next; // store cursor for the next page
          return copy;
        });
      } finally {
        setLoading(false);
      }
    },
    [cursorStack],
  );

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" }); // or "smooth"
    });
  }, [cursorIndex]);

  const refreshBookings = useCallback(
    ({ limit } = {}) => {
      setCursorStack([null]);
      setCursorIndex(0);
      setHasMore(false);
      fetchPageAt({ index: 0, limit: limit || LIMIT });
    },
    [fetchPageAt],
  );

  const nextPage = useCallback(() => {
    const tokenForNext = cursorStack[cursorIndex + 1];
    if (!tokenForNext) return; // no more pages
    fetchPageAt({ index: cursorIndex + 1, limit: LIMIT });
  }, [cursorIndex, cursorStack, fetchPageAt]);

  const previousPage = useCallback(() => {
    if (cursorIndex === 0) return;
    fetchPageAt({ index: cursorIndex - 1, limit: LIMIT });
  }, [cursorIndex, fetchPageAt]);

  useEffect(() => {
    refreshBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Breadcrumb pageName="Past Bookings" parent="Bookings" />
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No past bookings"
          loading={loading}
          onClickNextPage={nextPage}
          onClickPrevPage={previousPage}
          hasMore={hasMore}
          isAtStart={isAtStart}
          showPagination={true}
        />
      </div>
    </div>
  );
}
