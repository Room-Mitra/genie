"use client";

import { useMemo, useState } from "react";
import {
  WifiIcon,
  BuildingOffice2Icon,
  ChevronUpDownIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { WifiOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RoomsGrid
 *
 * Props:
 *  - rooms: Array<Room>
 *  - onSelectRoom?: (room: Room) => void
 *
 * Room shape example:
 * {
 *   id: "01H...",
 *   floor: 3,
 *   number: "305",
 *   type: "Deluxe", // e.g., Standard | Deluxe | Suite
 *   status: "occupied" | "empty" | "checkout_soon",
 *   guestName?: "A. Sharma",
 *   checkoutAt?: string, // ISO, used when status === "checkout_soon"
 *   device: { online: boolean, lastSeenIso?: string }
 * }
 */

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

const typeOrder = ["Suite", "Deluxe", "Standard"]; // used as a tertiary sort key

export function RoomsGrid({ rooms = [], onSelectRoom }) {
  const [query, setQuery] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false); // show offline devices or checkout soon

  const sorted = useMemo(() => {
    const copy = [...rooms];
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
      return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
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
        String(r.guestName || "")
          .toLowerCase()
          .includes(q);
      const issue = !r.device?.online || r.status === "checkout_soon";
      return matches && (!onlyIssues || issue);
    });
  }, [sorted, query, onlyIssues]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <BuildingOffice2Icon className="size-5" />
          <span className="font-medium">Rooms</span>
          <span className="text-xs">
            ({filtered.length} / {rooms.length})
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search floor, room, type, guest"
              className="w-64 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-transparent focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <ChevronUpDownIcon className="pointer-events-none absolute right-2 top-2.5 size-5 text-zinc-400" />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-amber-600"
              checked={onlyIssues}
              onChange={(e) => setOnlyIssues(e.target.checked)}
            />
            <span className="text-zinc-700 dark:text-zinc-300">
              Only attention
            </span>
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        <LegendSwatch label="Occupied" className="bg-emerald-600" />
        <LegendSwatch label="Checkout soon" className="bg-amber-600" />
        <LegendSwatch label="Empty" className="bg-zinc-700 dark:bg-zinc-500" />
        <span className="ml-2 inline-flex items-center gap-1">
          <WifiIcon className="size-4" /> online
        </span>
        <span className="inline-flex items-center gap-1">
          <WifiOffIcon className="size-4" /> offline
        </span>
      </div>

      {/* Grid */}
      <div
        className={cn(
          "grid gap-3",
          // Responsive columns
          "[grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]",
        )}
      >
        {filtered.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => onSelectRoom?.(room)}
          />
        ))}
      </div>
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

function RoomCard({ room, onClick }) {
  const styles = statusStyles(room.status);
  const lastSeenText = room.device?.online
    ? "Online"
    : `Offline · last seen ${formatRelative(room.device?.lastSeenIso)}`;
  const title = room.device?.online
    ? `Tablet online (${formatRelative(room.device?.lastSeenIso)})`
    : `Tablet offline · last seen ${formatRelative(room.device?.lastSeenIso)}`;

  return (
    <button
      onClick={onClick}
      title={`${room.type} • Floor ${room.floor} • ${title}`}
      className={cn(
        "group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left shadow-sm transition",
        styles.bg,
        styles.border,
        "hover:ring-2",
        styles.ring,
      )}
    >
      {/* Top line: Room number + type */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 flex-col">
          <div className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {room.number}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
            <TagIcon className="size-4" />
            <span className="truncate">{room.type}</span>
          </div>
        </div>
        {/* Status badge */}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            styles.badge,
          )}
        >
          {room.status === "occupied"
            ? "Occupied"
            : room.status === "checkout_soon"
              ? "Checkout soon"
              : "Empty"}
        </span>
      </div>

      {/* Center: Guest name (if any) */}
      <div
        className={cn(
          "mt-2 line-clamp-2 text-sm",
          room.guestName
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 dark:text-zinc-400",
        )}
      >
        <div className="flex items-center gap-2">
          <UserIcon className="size-5" />
          <span className="truncate">
            {room.guestName || (room.status === "empty" ? "—" : "Guest TBD")}
          </span>
        </div>
        {room.status === "checkout_soon" && room.checkoutAt && (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
            <ClockIcon className="size-4" />
            <span title={new Date(room.checkoutAt).toLocaleString()}>
              Checkout {timeUntil(room.checkoutAt)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: Device status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300">
          {room.device?.online ? (
            <WifiIcon className="size-4" />
          ) : (
            <WifiOffIcon className="size-4" />
          )}
          <span className="truncate" title={title}>
            {lastSeenText}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Floor {room.floor}
        </span>
      </div>

      {/* Hover overlay for more detail */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/5 p-3 text-center text-xs text-zinc-800 backdrop-blur-sm group-hover:flex dark:bg-white/5 dark:text-zinc-200">
        <div className="space-y-1">
          <div className="font-semibold">Room {room.number}</div>
          <div>
            {room.type} • Floor {room.floor}
          </div>
          <div>
            {room.guestName
              ? `Guest: ${room.guestName}`
              : room.status === "empty"
                ? "Currently empty"
                : "Guest info pending"}
          </div>
          <div>
            {room.device?.online
              ? `Tablet online (${formatRelative(room.device?.lastSeenIso)})`
              : `Tablet offline · last seen ${formatRelative(room.device?.lastSeenIso)}`}
          </div>
        </div>
      </div>
    </button>
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
