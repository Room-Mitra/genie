"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WifiIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";

import { BedDoubleIcon, WifiOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoomNumberType } from "./roomNumberType";
import { stringToColor } from "@/lib/text";
import InputGroup from "../FormElements/InputGroup";
import Link from "next/link";
import { DeleteModal } from "../ui/delete-modal";
import { Room } from "../ui/room";
import { toast } from "react-toastify";
import { DeleteButton } from "../ui/delete-button";
import { Spinner } from "@material-tailwind/react";

async function fetchRooms() {
  const res = await fetch(`/api/rooms`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch rooms");
  }

  return await res.json();
}

function minutesSince(iso) {
  if (!iso) return null;
  const now = new Date();
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function formatRelative(iso) {
  if (!iso) return "unknown";
  const mins = minutesSince(iso);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function statusStyles(status) {
  // base (background + border + ring for hover)
  switch (status) {
    case "occupied":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-300 dark:border-emerald-800",
        ring: "ring-emerald-400/40",
        badge: "bg-emerald-600 text-white",
      };
    case "checkout_soon":
      return {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-300 dark:border-amber-800",
        ring: "ring-amber-400/40",
        badge: "bg-amber-600 text-white",
      };
    default:
      return {
        bg: "bg-zinc-50 dark:bg-zinc-900/30",
        border: "border-zinc-300 dark:border-zinc-800",
        ring: "ring-zinc-400/30",
        badge: "bg-zinc-700 text-white dark:bg-zinc-600",
      };
  }
}

export function RoomsGrid() {
  const [rooms, setRooms] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [query, setQuery] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false); // show offline devices or checkout soon

  const sorted = useMemo(() => {
    const copy = rooms.length ? [...rooms] : [];
    copy.sort((a, b) => {
      // 1) floor asc
      if (a.floor !== b.floor) return a.floor - b.floor;
      // 2) room number numeric then lexic
      const an = parseInt(String(a.number).replace(/\D/g, ""), 10);
      const bn = parseInt(String(b.number).replace(/\D/g, ""), 10);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn) return an - bn;
      if (a.number !== b.number)
        return String(a.number).localeCompare(String(b.number), undefined, {
          numeric: true,
        });
      // 3) type order
      return 1;
    });
    return copy;
  }, [rooms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((r) => {
      const matches =
        !q ||
        String(r.number).toLowerCase().includes(q) ||
        String(r.floor).toLowerCase().includes(q) ||
        String(r.type).toLowerCase().includes(q) ||
        String(r?.activeBooking?.guest?.firstName).toLowerCase().includes(q) ||
        String(r?.activeBooking?.guest?.lastName).toLowerCase().includes(q);

      return matches;
    });
  }, [sorted, query]);

  const refreshRooms = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchRooms();
      setRooms(data?.items);
    } catch (err) {
      toast.error(`Error fetching rooms: ${err?.message || err}`);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  async function deleteRoom(roomId) {
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "DELETE",
      credentials: "include",
    });

    setShowDeleteModal(false);
    setRoomToDelete(null);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(`Failed to delete room: ${err.error}`);
      return;
    }

    toast.success("Room deleted");
    refreshRooms();
  }

  useEffect(() => {
    // initial load
    refreshRooms();

    // refresh every minute
    const interval = setInterval(refreshRooms, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRooms]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* Header / Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <BedDoubleIcon className="size-5" />
            <span className="font-medium">Rooms</span>
            <span className="text-sm">
              ({filtered.length} / {rooms.length})
            </span>
            <Link
              className="mx-4 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
              href="/rooms/new"
            >
              + New Room
            </Link>
          </div>

          <InputGroup
            type="text"
            className="w-60 sm:w-75"
            name="query"
            placeholder="search floor, room, type, guest"
            value={query}
            handleChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <LegendSwatch label="Occupied" className="bg-emerald-600" />
            <LegendSwatch label="Checkout soon" className="bg-amber-600" />
            <LegendSwatch
              label="Empty"
              className="bg-zinc-700 dark:bg-zinc-500"
            />
            <span className="ml-2 inline-flex items-center gap-1">
              <WifiIcon className="size-4" /> Online
            </span>
            <span className="inline-flex items-center gap-1">
              <WifiOffIcon className="size-4" /> Offline
            </span>
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-amber-600"
                checked={needsAttention}
                onChange={(e) => setNeedsAttention(e.target.checked)}
              />
              <span className="text-zinc-700 dark:text-zinc-300">
                Needs attention
              </span>
            </label>
          </div>
        </div>

        {/* Grid */}
        {isRefreshing && filtered.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center text-center">
            <Spinner />
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))]",
              isRefreshing && "animate-pulse opacity-100 backdrop-blur-[2px]",
            )}
          >
            {filtered.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                onClick={() => {}}
                highlightAttention={
                  needsAttention &&
                  !room.noDevice &&
                  (!room.device?.online || room.status === "checkout_soon")
                }
                onDelete={(r) => {
                  setRoomToDelete(r);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        showModal={showDeleteModal}
        onClose={() => {
          setRoomToDelete(null);
          setShowDeleteModal(false);
        }}
        message={
          <div className="px-6">
            <div className="py-6 font-bold">
              Are you sure you want to delete room?
            </div>
            <div className="pb-6">
              <Room room={roomToDelete} wide={true} />
            </div>
          </div>
        }
        header={"Delete room"}
        onConfirmDelete={async () => await deleteRoom(roomToDelete.roomId)}
      />
    </div>
  );
}

function LegendSwatch({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded-sm", className)} />
      <span>{label}</span>
    </span>
  );
}

function RoomCard({ room, highlightAttention, onClick, onDelete }) {
  const styles = statusStyles(room.status);
  const lastSeenText = room.device?.online
    ? `Online · last seen ${formatRelative(room.device?.lastSeen)}`
    : `Offline · last seen ${formatRelative(room.device?.lastSeen)}`;

  const getGuestName = (guest) => {
    if (!guest || !guest.firstName || !guest.lastName) {
      return null;
    }

    const first = guest.firstName.trim();
    const lastInitial = guest.lastName.trim().charAt(0).toUpperCase();

    return `${first} ${lastInitial}.`;
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-2xl border text-left shadow-sm transition",
          "p-3 text-sm",
          styles.bg,
          styles.border,
          "hover:ring-2",
          styles.ring,
          highlightAttention && "animate-pulse ring-2 ring-rose-500/70",
        )}
      >
        {/* Top line: Room number + type */}
        <div className="flex items-start justify-between">
          <RoomNumberType number={room.number} type={room.type} />

          {/* Status badge */}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              styles.badge,
            )}
          >
            {room.status === "occupied"
              ? "Occupied"
              : room.status === "checkout_soon"
                ? "Checkout"
                : "Empty"}
          </span>
        </div>

        {/* Center: Guest name (if any) */}
        <div
          className={cn(
            "mt-2 line-clamp-2 text-sm",
            room?.activeBooking?.guest
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          <div className="flex items-center gap-2">
            <UserIcon className="size-5" />
            <span className="truncate font-bold">
              {getGuestName(room?.activeBooking?.guest) ||
                (room.status === "empty" ? "—" : "Guest TBD")}
            </span>
          </div>
          {room.status === "checkout_soon" && (
            <div className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
              <ClockIcon className="size-4" />
              <span
                title={new Date(
                  room?.activeBooking?.checkOutTime,
                ).toLocaleString()}
              >
                Checkout {timeUntil(room?.activeBooking?.checkOutTime)}
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Device status */}

        <div className="flex items-center justify-between">
          {room.noDevice ? (
            <span className="text-sm">No device in room</span>
          ) : (
            <div className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              {room.device?.online ? (
                <WifiIcon className="size-4" />
              ) : (
                <WifiOffIcon className="size-4" />
              )}
              <span className="w-28">{lastSeenText}</span>
            </div>
          )}
          <span
            className="text-sm font-semibold"
            style={{ color: stringToColor(room.type) }}
          >
            {room.floor}F
          </span>
        </div>

        {/* Hover overlay for more detail */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/5 p-3 text-center text-sm text-zinc-800 backdrop-blur-sm group-hover:flex dark:bg-white/5 dark:text-zinc-200">
          {/* Delete button positioned absolutely in the top-right corner */}
          <div className="pointer-events-auto absolute right-2 top-2">
            <DeleteButton
              noToolTip={true}
              onClick={() => {
                onDelete(room);
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="font-semibold">Room {room.number}</div>
            <div>
              {room.type} • Floor {room.floor}
            </div>
            <div>
              {room?.activeBooking?.guest
                ? `Guest: ${getGuestName(room?.activeBooking?.guest)}`
                : room.status === "empty"
                  ? "Currently empty"
                  : "Guest info pending"}
            </div>
            <div>
              {room.noDevice ? (
                "No device in room"
              ) : room.device?.online ? (
                `Tablet online · last seen ${formatRelative(room.device?.lastSeen)}`
              ) : (
                <span
                  className={cn(highlightAttention && "font-bold text-red")}
                >
                  Tablet offline · last seen{" "}
                  {formatRelative(room.device?.lastSeen)}
                </span>
              )}
            </div>
            {highlightAttention &&
              room.status === "checkout_soon" &&
              !room.noDevice && (
                <div className="font-bold text-red">
                  Check tablet is in room after checkout
                </div>
              )}
          </div>
        </div>
      </button>
    </>
  );
}

function timeUntil(iso) {
  const now = new Date();
  const then = new Date(iso);
  const diff = then.getTime() - now.getTime();
  if (diff <= 0) return "now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs} hr${hrs > 1 ? "s" : ""}`;
  const days = Math.round(hrs / 24);
  return `in ${days} day${days > 1 ? "s" : ""}`;
}
