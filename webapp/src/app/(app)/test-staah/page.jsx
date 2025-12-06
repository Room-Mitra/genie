"use client";

import React, { useState } from "react";

const STA_AH_ENDPOINT = "https://csbe.staah.net/";
const PROPERTY_ID = decodeURIComponent(
  "981MgIuc40XLDoFWOm6Lb03jIkZRzwdE4dsh4FCblzqm3k8JVzcdjjQ3MDY%3D",
);
const API_KEY = "cPPq1uh0xD6BpfDFpGWEx9fxnDOUA3Y25RdigC0X";

// Simple JSX demo component that uses getAvailableRooms
export default function StaahRoomsDemo() {
  const today = new Date().toISOString().split("T")[0];
  const threeDaysFromToday = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(threeDaysFromToday);

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams({
        startDate,
        endDate,
      });

      const res = await fetch(`/api/staah/room-availability?${qs.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("failed to get staah available rooms");
      const result = await res.json();
      setRooms(result.availableRooms);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100">
      <h1 className="text-xl font-semibold">
        STA AH getAvailableRooms wrapper demo
      </h1>

      <pre className="overflow-x-auto rounded-md bg-zinc-800 p-3 text-xs">
        {`curl '${STA_AH_ENDPOINT}?RequestType=bedata&Product=no&PropertyId=${PROPERTY_ID}&CheckInDate=${startDate}&CheckOutDate=${endDate}&JDRN=Y&Country=IN&DeviceType=desktop&Lang=EN' \\
  -H 'accept: application/json' \\
  -H 'x-api-key: ${API_KEY}'`}
      </pre>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="mb-1 text-xs" htmlFor="startDate">
            Check in (YYYY-MM-DD)
          </label>
          <input
            name="startDate"
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="2026-05-01"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-xs" htmlFor="endDate">
            Check out (YYYY-MM-DD)
          </label>
          <input
            name="endDate"
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="2026-05-03"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded bg-amber-400 px-4 py-2 font-medium text-black disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading…" : "Get Available Rooms"}
        </button>
      </div>

      {error && <div className="text-xs text-red-400">Error: {error}</div>}

      <div className="space-y-3">
        {rooms.length === 0 && !loading && !error && (
          <div className="text-xs text-zinc-400">
            No rooms available for the entire duration or nothing loaded yet.
          </div>
        )}

        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">
                  {room.roomType}{" "}
                  <span className="text-xs text-zinc-400">({room.roomId})</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Max occupancy: {room.maxOccupancy ?? "N/A"}
                </div>
              </div>
              <div className="text-right text-xs text-zinc-300">
                Available rooms for entire stay:{" "}
                <span className="font-semibold">
                  {room.availability.availableRooms}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <div className="font-semibold">Pricing (room only)</div>
                {room.pricing.withoutBreakfast ? (
                  <div>
                    <div>
                      Plan: {room.pricing.withoutBreakfast.ratePlanName}
                    </div>
                    <div>
                      Avg per night:{" "}
                      {room.pricing.withoutBreakfast.pricePerNight.toFixed(2)}{" "}
                      {room.currency}
                    </div>
                    <div>
                      Total for stay:{" "}
                      {room.pricing.withoutBreakfast.totalForStay.toFixed(2)}{" "}
                      {room.currency}
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-400">
                    No room only pricing available for all nights.
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-semibold">Pricing (with breakfast)</div>
                {room.pricing.withBreakfast ? (
                  <div>
                    <div>Plan: {room.pricing.withBreakfast.ratePlanName}</div>
                    <div>
                      Avg per night:{" "}
                      {room.pricing.withBreakfast.pricePerNight.toFixed(2)}{" "}
                      {room.currency}
                    </div>
                    <div>
                      Total for stay:{" "}
                      {room.pricing.withBreakfast.totalForStay.toFixed(2)}{" "}
                      {room.currency}
                    </div>
                  </div>
                ) : (
                  <div className="text-zinc-400">
                    No breakfast included pricing available for all nights.
                  </div>
                )}
              </div>
            </div>

            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-amber-300">
                Nightly breakdown
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full border border-zinc-700 text-[11px]">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="border border-zinc-700 px-2 py-1 text-left">
                        Date
                      </th>
                      <th className="border border-zinc-700 px-2 py-1 text-right">
                        Room only
                      </th>
                      <th className="border border-zinc-700 px-2 py-1 text-right">
                        With breakfast
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.nightlyBreakdown.map((night) => (
                      <tr key={night.date}>
                        <td className="border border-zinc-700 px-2 py-1">
                          {night.date}
                        </td>
                        <td className="border border-zinc-700 px-2 py-1 text-right">
                          {night.withoutBreakfast != null
                            ? `${night.withoutBreakfast.toFixed(2)} ${room.currency}`
                            : "N/A"}
                        </td>
                        <td className="border border-zinc-700 px-2 py-1 text-right">
                          {night.withBreakfast != null
                            ? `${night.withBreakfast.toFixed(2)} ${room.currency}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
