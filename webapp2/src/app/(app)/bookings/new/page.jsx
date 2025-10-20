"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

// ---------------------------------------------
// Utility helpers
// ---------------------------------------------
const cn = (...classes) => classes.filter(Boolean).join(" ");

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------
// Mock API layer (simulate latency)
// ---------------------------------------------
const mockRooms = Array.from({ length: 30 }).map((_, i) => ({
  id: `room-${i + 101}`,
  roomNumber: String(100 + i + 1),
  type: i % 3 === 0 ? "Deluxe" : i % 3 === 1 ? "Suite" : "Standard",
}));

const mockGuests = [
  {
    id: "g-1",
    name: "Ravi Kumar",
    mobile: "9876543210",
    email: "ravi@example.com",
  },
  {
    id: "g-2",
    name: "Anita Sharma",
    mobile: "9988776655",
    email: "anita@example.com",
  },
  {
    id: "g-3",
    name: "Rahul Mehta",
    mobile: "9123456780",
    email: "rahul@example.com",
  },
];

const api = {
  async searchRooms(q) {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "").toLowerCase();
    return mockRooms
      .filter(
        (r) => r.roomNumber.includes(s) || r.type.toLowerCase().includes(s),
      )
      .slice(0, 8);
  },
  async searchGuestsByMobile(q) {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "");
    return mockGuests.filter((g) => g.mobile.includes(s)).slice(0, 8);
  },
  async createGuest(data) {
    await new Promise((r) => setTimeout(r, 350));
    const id = `g-${Math.random().toString(36).slice(2, 8)}`;
    const guest = { id, ...data };
    mockGuests.unshift(guest);
    return guest;
  },
  async createBooking(data) {
    await new Promise((r) => setTimeout(r, 500));
    return { id: `b-${Date.now()}`, ...data, status: "CONFIRMED" };
  },
};

// ---------------------------------------------
// Autocomplete primitive
// ---------------------------------------------
function Autocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  fetcher,
  renderItem,
  getDisplayValue,
  noResultsContent,
  rightAddon,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ? getDisplayValue(value) : "");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);
  const wrapperRef = useRef(null);

  const debounced = useDebounce(query, 200);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetcher(debounced);
        if (!alive) return;
        setItems(res);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (open) load();
    return () => {
      alive = false;
    };
  }, [debounced, fetcher, open]);

  useEffect(() => {
    onChange?.(query);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        const chosen = items[activeIndex];
        onSelect?.(chosen);
        setQuery(getDisplayValue(chosen));
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      <div className="relative">
        <InputGroup
          label={label}
          placeholder={placeholder}
          value={query}
          handleChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {rightAddon && (
          <div className="absolute inset-y-0 right-2 flex items-center align-middle">
            {rightAddon}
          </div>
        )}

        {open && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">
            {loading ? (
              <div className="p-3 text-sm text-gray-400">Searching...</div>
            ) : items.length > 0 ? (
              <ul ref={listRef} className="max-h-64 overflow-auto py-1">
                {items.map((it, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm text-gray-100 hover:bg-gray-800",
                      idx === activeIndex && "bg-gray-800",
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect?.(it);
                      setQuery(getDisplayValue(it));
                      setOpen(false);
                    }}
                  >
                    {renderItem(it)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-sm text-gray-400">
                {noResultsContent || "No matches"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
``;

// ---------------------------------------------
// Main booking form
// ---------------------------------------------
export default function AddBookingPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [roomQuery, setRoomQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [guestQuery, setGuestQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Modal form state
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "",
    floor: "",
    description: "",
  });
  const [savingGuest, setSavingGuest] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  const canSubmit = useMemo(() => {
    return checkIn && checkOut && selectedRoom && selectedGuest && !creating;
  }, [checkIn, checkOut, selectedRoom, selectedGuest, creating]);

  function resetForm() {
    setCheckIn("");
    setCheckOut("");
    setSelectedRoom(null);
    setSelectedGuest(null);
    setRoomQuery("");
    setGuestQuery("");
    setGuestForm({ firstName: "", lastName: "", mobile: "", email: "" });
    setRoomForm({ number: "", type: "", floor: "", description: "" });
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    try {
      const booking = await api.createBooking({
        checkIn,
        checkOut,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        guestId: selectedGuest.id,
        guestName: selectedGuest.name,
        guestMobile: selectedGuest.mobile,
      });
      toast.success(`Booking ${booking.id} created`);
      resetForm();
    } catch (err) {
      toast.error("Failed to create booking");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveGuest(e) {
    e.preventDefault();
    setSavingGuest(true);
    try {
      // Basic validation
      if (!guestForm.firstName || !guestForm.lastName || !guestForm.mobile) {
        throw new Error("First name, last name, and mobile are required");
      }
      const newGuest = await api.createGuest(guestForm);
      setSelectedGuest(newGuest);
      setGuestQuery(newGuest.mobile);
      setShowGuestModal(false);
      setGuestForm({ name: "", mobile: "", email: "" });
      setToast({ type: "success", message: "Guest added" });
    } catch (e) {
      setToast({ type: "error", message: e.message || "Failed to add guest" });
    } finally {
      setSavingGuest(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  async function handleSaveRoom(e) {
    e.preventDefault();
    setSavingRoom(true);
    try {
      // Basic validation
      if (!roomForm.number || !roomForm.type) {
        throw new Error("Room number and type are required");
      }
      const newRoom = await api.createRoom(roomForm);
      setSelectedRoom(newRoom);
      setRoomQuery(newRoom.number);
      setShowRoomModal(false);
      setRoomForm({ number: "", type: "" });
      setToast({ type: "success", message: "Room added" });
    } catch (e) {
      setToast({ type: "error", message: e.message || "Failed to add room" });
    } finally {
      setSavingRoom(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <div className="mb-10">
        <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
          Add Booking
        </h2>
        <p className="text-md mt-1 text-dark dark:text-gray-300">
          Create a booking with check in, check out, room, and guest details.
        </p>
      </div>

      <form onSubmit={handleCreateBooking} className="grid grid-cols-1 gap-5">
        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputGroup
            type="date"
            label="Check in"
            name="checkin"
            value={checkIn}
            handleChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />

          <InputGroup
            type="date"
            label="Check out"
            name="checkout"
            value={checkOut}
            handleChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || undefined}
          />
        </div>

        {/* Room autocomplete */}
        <Autocomplete
          label="Room"
          placeholder="Search room number or type"
          value={selectedRoom}
          onChange={(q) => setRoomQuery(q)}
          onSelect={(room) => setSelectedRoom(room)}
          fetcher={api.searchRooms}
          getDisplayValue={(room) =>
            room?.roomNumber ? `#${room.roomNumber}` : ""
          }
          renderItem={(room) => (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/20 text-xs text-indigo-300">
                  {room.roomNumber}
                </span>
                <span className="text-gray-200">{room.type}</span>
              </div>
              <span className="text-xs text-gray-400">ID {room.id}</span>
            </div>
          )}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowRoomModal(true)}
              className="mt-8 rounded-lg border border-gray-700 bg-gray-300 px-2 py-1 text-xs text-dark hover:bg-gray-600"
              aria-label="Add new room"
            >
              New
            </button>
          }
          noResultsContent={
            <div className="flex items-center justify-between">
              <span>Room not found</span>
              <button
                type="button"
                onClick={() => setShowRoomModal(true)}
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
              >
                Add new room
              </button>
            </div>
          }
        />

        {/* Guest autocomplete */}
        <Autocomplete
          label="Guest by mobile"
          placeholder="Type mobile number"
          value={selectedGuest}
          onChange={(q) => setGuestQuery(q)}
          onSelect={(guest) => setSelectedGuest(guest)}
          fetcher={api.searchGuestsByMobile}
          getDisplayValue={(guest) => guest?.mobile || ""}
          renderItem={(guest) => (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-200">{guest.name}</div>
                <div className="text-xs text-gray-400">{guest.mobile}</div>
              </div>
              <span className="text-xs text-gray-400">{guest.email}</span>
            </div>
          )}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowGuestModal(true)}
              className="mt-8 rounded-lg border border-gray-700 bg-gray-300 px-2 py-1 text-xs text-dark hover:bg-gray-600"
              aria-label="Add new guest"
            >
              New
            </button>
          }
          noResultsContent={
            <div className="flex items-center justify-between">
              <span>No guest found</span>
              <button
                type="button"
                onClick={() => setShowGuestModal(true)}
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
              >
                Add new guest
              </button>
            </div>
          }
        />

        {/* Summary */}
        <div className="mt-7 rounded-2xl border border-gray-700 p-4 text-dark dark:text-white">
          <h3 className="text-md mb-3 font-semibold">Summary</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="text-md">
              <span>Check in:</span> {checkIn || "—"}
            </div>
            <div className="text-md">
              <span>Check out:</span> {checkOut || "—"}
            </div>
            <div className="text-md">
              <span>Room:</span>{" "}
              {selectedRoom
                ? `#${selectedRoom.roomNumber} (${selectedRoom.type})`
                : "—"}
            </div>
            <div className="text-md">
              <span>Guest:</span>{" "}
              {selectedGuest
                ? `${selectedGuest.name} (${selectedGuest.mobile})`
                : "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              canSubmit
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "cursor-not-allowed bg-gray-700 text-gray-400",
            )}
          >
            {creating ? "Creating..." : "Create booking"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark dark:text-gray-300 hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Add Guest Modal */}
      <div>
        <Dialog
          open={showGuestModal}
          onClose={() => setShowGuestModal(false)}
          className="relative z-40"
        >
          <DialogBackdrop
            transition
            className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in fixed inset-0 bg-gray-900/50 transition-opacity"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95 relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-dark dark:text-white"
                  >
                    Add new guest
                  </DialogTitle>

                  <div className="mt-4">
                    <form onSubmit={handleSaveGuest} className="grid gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputGroup
                          required
                          type="text"
                          name="firstName"
                          label="First Name"
                          placeholder="Kiran"
                          value={guestForm.firstName}
                          handleChange={(e) =>
                            setGuestForm((s) => ({
                              ...s,
                              firstName: e.target.value,
                            }))
                          }
                        />

                        <InputGroup
                          required
                          type="text"
                          name="lastName"
                          label="Last Name"
                          placeholder="Kumar"
                          value={guestForm.lastName}
                          handleChange={(e) =>
                            setGuestForm((s) => ({
                              ...s,
                              lastName: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <InputGroup
                        type="tel"
                        name="mobile"
                        label="Mobile"
                        placeholder="10 digit mobile"
                        value={guestForm.mobile}
                        handleChange={(e) =>
                          setGuestForm((s) => ({
                            ...s,
                            mobile: e.target.value,
                          }))
                        }
                      />

                      <InputGroup
                        type="email"
                        name="email"
                        label="Email"
                        placeholder="name@example.com"
                        value={guestForm.email}
                        handleChange={(e) =>
                          setGuestForm((s) => ({ ...s, email: e.target.value }))
                        }
                      />

                      <div className="mt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowGuestModal(false)}
                          className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-white dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm font-medium",
                            savingGuest
                              ? "bg-gray-700 text-gray-400"
                              : "bg-indigo-600 text-white hover:bg-indigo-500",
                          )}
                          disabled={savingGuest}
                        >
                          {savingGuest ? "Saving..." : "Save guest"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Add Room Modal */}
      <div>
        <Dialog
          open={showRoomModal}
          onClose={() => setShowRoomModal(false)}
          className="relative z-40"
        >
          <DialogBackdrop
            transition
            className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in fixed inset-0 bg-gray-900/50 transition-opacity"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95 relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-dark dark:text-white"
                  >
                    Add new room
                  </DialogTitle>

                  <div className="mt-4">
                    <form onSubmit={handleSaveRoom} className="grid gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputGroup
                          required
                          type="text"
                          name="roomType"
                          label="Room Type"
                          placeholder="Deluxe"
                          value={roomForm.roomType}
                          handleChange={(e) =>
                            setRoomForm((s) => ({
                              ...s,
                              roomType: e.target.value,
                            }))
                          }
                        />

                        <InputGroup
                          required
                          type="text"
                          name="roomNumber"
                          label="Room Number"
                          placeholder="101"
                          value={roomForm.roomNumber}
                          handleChange={(e) =>
                            setRoomForm((s) => ({
                              ...s,
                              roomNumber: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputGroup
                          required
                          type="text"
                          name="floor"
                          label="Floor"
                          placeholder="2"
                          value={roomForm.floor}
                          handleChange={(e) =>
                            setRoomForm((s) => ({
                              ...s,
                              floor: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <InputGroup
                        type="text"
                        name="description"
                        label="Description"
                        placeholder="Room description"
                        value={roomForm.description}
                        handleChange={(e) =>
                          setRoomForm((s) => ({
                            ...s,
                            description: e.target.value,
                          }))
                        }
                      />

                      <div className="mt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowRoomModal(false)}
                          className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-white dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={cn(
                            "rounded-xl px-4 py-2 text-sm font-medium",
                            savingRoom
                              ? "bg-gray-700 text-gray-400"
                              : "bg-indigo-600 text-white hover:bg-indigo-500",
                          )}
                          disabled={savingRoom}
                        >
                          {savingRoom ? "Saving..." : "Save room"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
