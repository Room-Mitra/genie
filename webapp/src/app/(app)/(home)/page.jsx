"use client";

import { RoomsGrid } from "@/components/Rooms/grid";
import { useRouter } from "next/navigation";

export default function Home() {
  // const { selected_time_frame } = await searchParams;
  // const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);
  const router = useRouter();

  const sample = [
    {
      id: "r-301",
      floor: 3,
      number: "301",
      type: "Deluxe",
      status: "occupied",
      guestName: "Priya K.",
      device: { online: true, lastSeenIso: new Date().toISOString() },
    },
    {
      id: "r-302",
      floor: 3,
      number: "302",
      type: "Standard",
      status: "empty",
      device: {
        online: false,
        lastSeenIso: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      },
    },
    {
      id: "r-303",
      floor: 3,
      number: "303",
      type: "Suite",
      status: "checkout_soon",
      guestName: "R. Nair",
      checkoutAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
      device: {
        online: true,
        lastSeenIso: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    },
    {
      id: "r-201",
      floor: 2,
      number: "201",
      type: "Standard",
      status: "occupied",
      guestName: "A. Sharma",
      device: {
        online: false,
        lastSeenIso: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
    },
    {
      id: "r-104",
      floor: 1,
      number: "104",
      type: "Deluxe",
      status: "empty",
      device: {
        online: true,
        lastSeenIso: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      },
    },
  ];

  return (
    <div className="p-4">
      <RoomsGrid
        rooms={sample}
        onSelectRoom={(room) => alert(`Open room ${room.number}`)}
      />
    </div>
  );
}
