"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Autocomplete } from "./_components/autocomplete";
import { cn } from "@/lib/utils";
import { check } from "prettier";
import {
  formatDate,
  formatMessageTime,
  formatTimeString,
} from "@/lib/format-message-time";

async function addRoom({ roomNumber, roomType, floor, description }) {
  const res = await fetch(`/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomNumber, roomType, floor, description }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add room");
  }

  return res.json();
}

async function addGuest({ firstName, lastName, mobile }) {
  const res = await fetch(`/api/guests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, mobile }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add guest");
  }

  return res.json();
}

// ---------------------------------------------
// Mock API layer (simulate latency)
// ---------------------------------------------
const mockRooms = Array.from({ length: 30 }).map((_, i) => ({
  id: `room-${i + 101}`,
  number: String(100 + i + 1),
  type: i % 3 === 0 ? "Deluxe" : i % 3 === 1 ? "Suite" : "Standard",
}));

const mockGuests = [
  {
    id: "g-1",
    firstName: "Ravi",
    lastName: "Kumar",
    mobile: "9876543210",
  },
  {
    id: "g-2",
    firstName: "Anita",
    lastName: "Sharma",
    mobile: "9988776655",
  },
  {
    id: "g-3",
    firstName: "Rahul",
    lastName: "Mehta",
    mobile: "9123456780",
  },
];

const api = {
  async searchRooms(q) {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "").toLowerCase();
    return mockRooms
      .filter(
        (r) =>
          r.number.includes(s) ||
          r.type.toLowerCase().includes(s) ||
          r.description?.includes(s),
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
  async createRoom(data) {
    await new Promise((r) => setTimeout(r, 350));
    const id = `room-${Math.random().toString(36).slice(2, 8)}`;
    const room = { id, ...data };
    mockRooms.unshift(room);
    return room;
  },
  async createBooking(data) {
    await new Promise((r) => setTimeout(r, 500));
    return { id: `b-${Date.now()}`, ...data, status: "CONFIRMED" };
  },
};

// ---------------------------------------------
// Main booking form
// ---------------------------------------------
export default function AddBookingPage() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("13:00");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  // const [roomQuery, setRoomQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "",
    floor: "",
    description: "",
  });

  const [savingRoom, setSavingRoom] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      checkInDate &&
      checkInTime &&
      checkOutDate &&
      checkOutTime &&
      selectedRoom &&
      firstName &&
      lastName &&
      mobile &&
      !creating
    );
  }, [
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    selectedRoom,
    firstName,
    lastName,
    mobile,
    creating,
  ]);

  function resetForm() {
    setCheckInDate("");
    setCheckInTime("13:00");
    setCheckOutDate("");
    setCheckOutTime("11:00");
    setSelectedRoom(null);
    setFirstName("");
    setLastName("");
    setMobile("");
    setRoomForm({ number: "", type: "", floor: "", description: "" });
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    try {
      const booking = await api.createBooking({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        roomId: selectedRoom.id,
        number: selectedRoom.number,
        // guestId: selectedGuest.id,
        // guestName: selectedGuest.name,
        // guestMobile: selectedGuest.mobile,
      });

      const data = {
        checkInDate: checkInDate,
        checkInTime: checkInTime,
        checkOutDate: checkOutDate,
        checkOutTime: checkOutTime,
        room: selectedRoom,

        booking: booking,
      };

      toast.success(`Booking ${booking.id} created`);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create booking", err);
    } finally {
      setCreating(false);
    }
  }

  const handleSaveRoomSubmit = async (e) => {
    e.preventDefault();
    setSavingRoom(true);
    // Basic validation
    if (!roomForm.number || !roomForm.type || !roomForm.floor) {
      toast.error("Room number, type, and floor are required");
      setSavingRoom(false);
      return;
    }

    try {
      const newRoom = await addRoom({
        roomNumber: roomForm.number,
        roomType: roomForm.type,
        floor: roomForm.floor,
        description: roomForm.description,
      });

      setSelectedRoom(newRoom);
      setShowRoomModal(false);
      setRoomForm({ number: "", type: "", floor: "", description: "" });

      toast.success("Room added");
    } catch (error) {
      toast.error(error.message || "Failed to save room");
    } finally {
      setSavingRoom(false);
    }
  };

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <InputGroup
            type="date"
            label="Check in"
            name="checkinDate"
            value={checkInDate}
            handleChange={(e) => setCheckInDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />

          <InputGroup
            type="time"
            label="&nbsp;"
            name="checkinTime"
            value={checkInTime}
            handleChange={(e) => setCheckInTime(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />

          <InputGroup
            type="date"
            label="Check out"
            name="checkoutDate"
            value={checkOutDate}
            handleChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || undefined}
          />

          <InputGroup
            type="time"
            label="&nbsp;"
            name="checkoutTime"
            value={checkOutTime}
            handleChange={(e) => setCheckOutTime(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Room autocomplete */}
        <Autocomplete
          label="Room"
          placeholder="Search room number or type"
          value={selectedRoom}
          onSelect={(room) => setSelectedRoom(room)}
          fetcher={api.searchRooms}
          getDisplayValue={(room) => (room?.number ? `#${room.number}` : "")}
          renderItem={(room) => (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/20 text-xs text-indigo-300">
                  {room.number}
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
              className="mt-8 rounded-lg border border-gray-700 bg-gray-300 px-2 py-1 text-xs font-medium text-dark hover:bg-gray-500"
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

        <hr className="my-6" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputGroup
            required
            type="text"
            name="firstName"
            label="First Name"
            placeholder="Kiran"
            value={firstName}
            handleChange={(e) => setFirstName(e.target.value)}
          />

          <InputGroup
            required
            type="text"
            name="lastName"
            label="Last Name"
            placeholder="Kumar"
            value={lastName}
            handleChange={(e) => setLastName(e.target.value)}
          />

          <InputGroup
            type="tel"
            name="mobile"
            label="Mobile"
            placeholder="9910203040"
            value={mobile}
            handleChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
          />
        </div>

        <hr className="my-6" />

        {/* Summary */}
        <div className="rounded-2xl border border-gray-700 p-4 text-dark dark:text-white">
          <h3 className="text-md mb-3 font-semibold">Summary</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="text-md">
              <span>Check in:</span>{" "}
              <span className="font-semibold">
                {(checkInDate && formatDate(checkInDate)) || "—"}{" "}
                {(checkInTime && formatTimeString(checkInTime)) || "—"}
              </span>
            </div>
            <div className="text-md">
              <span>Check out:</span>{" "}
              <span className="font-semibold">
                {(checkOutDate && formatDate(checkOutDate)) || "—"}{" "}
                {(checkOutTime && formatTimeString(checkOutTime)) || "—"}
              </span>
            </div>
            <div className="text-md">
              <span>Room:</span>{" "}
              {selectedRoom
                ? `#${selectedRoom.number} (${selectedRoom.type})`
                : "—"}
            </div>
            <div className="text-md">
              <span>Guest:</span> {"—"}
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
            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-gray-300"
          >
            Reset
          </button>
        </div>
      </form>

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
                    <form
                      onSubmit={handleSaveRoomSubmit}
                      className="grid gap-4"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputGroup
                          required
                          type="text"
                          name="type"
                          label="Room Type"
                          placeholder="Deluxe"
                          value={roomForm.type || ""}
                          handleChange={(e) =>
                            setRoomForm((s) => ({
                              ...s,
                              type: e.target.value,
                            }))
                          }
                        />

                        <InputGroup
                          required
                          type="text"
                          name="number"
                          label="Room Number"
                          placeholder="101"
                          value={roomForm.number || ""}
                          handleChange={(e) =>
                            setRoomForm((s) => ({
                              ...s,
                              number: e.target.value,
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
                          value={roomForm.floor || ""}
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
                        value={roomForm.description || ""}
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
