"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Autocomplete } from "./_components/autocomplete";
import { cn } from "@/lib/utils";
import {
  combineToUTC,
  formatDate,
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

async function fetchRooms() {
  const res = await fetch("/api/rooms", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch rooms");
  return await res.json();
}

async function createBooking(bookingData) {
  const res = await fetch(`/api/booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create booking");
  }
  return await res.json();
}

// ---------------------------------------------
// Main booking form
// ---------------------------------------------
export default function AddBookingPage() {
  const [rooms, setRooms] = useState([]);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("13:00");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

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
      mobileNumber &&
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
    mobileNumber,
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
    setMobileNumber("");
    setRoomForm({ number: "", type: "", floor: "", description: "" });
  }

  async function handleCreateBooking(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    try {
      const data = {
        checkInTime: combineToUTC(checkInDate, checkInTime),
        checkOutTime: combineToUTC(checkOutDate, checkOutTime),
        roomId: selectedRoom.roomId,
        guest: {
          firstName: firstName,
          lastName: lastName,
          mobileNumber: mobileNumber,
        },
      };

      const booking = await createBooking(data);

      toast.success(`Booking ${booking.bookingId.slice(0, 6)} created`);
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
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
      refreshRooms();

      toast.success("Room added");
    } catch (error) {
      toast.error(error.message || "Failed to save room");
    } finally {
      setSavingRoom(false);
    }
  };

  const refreshRooms = async () => {
    try {
      const rooms = await fetchRooms();
      setRooms(rooms?.items);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const searchRooms = async (q) => {
    await new Promise((r) => setTimeout(r, 250));
    const s = String(q || "").toLowerCase();
    return rooms
      .filter(
        (r) =>
          r.number.includes(s) ||
          r.type.toLowerCase().includes(s) ||
          r.description?.includes(s),
      )
      .slice(0, 8);
  };

  useEffect(() => {
    refreshRooms();
  }, []);

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
            required
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
            required
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
          required
          label="Room"
          placeholder="Search room number or type"
          value={selectedRoom}
          onSelect={(room) => setSelectedRoom(room)}
          fetcher={searchRooms}
          getDisplayValue={(room) => (room?.number ? `#${room.number}` : "")}
          renderItem={(room) => (
            <div className="grid grid-cols-2 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="inline-block rounded-full bg-cyan-600 px-3 py-2">
                  <span className="text-md text-white">#{room.number}</span>
                </div>
                <span className="text-dark dark:text-gray-200">
                  {room.type}
                </span>
              </div>
              <div className="text-md align-middle text-dark dark:text-gray-200">
                Floor: {room.floor}
              </div>
              <div className="text-md align-middle text-dark dark:text-gray-200">
                {room.description && `${room.description}`}
              </div>
            </div>
          )}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowRoomModal(true)}
              className="mt-8 rounded-lg border border-gray-700 bg-gray-300 px-2 py-1 text-xs font-medium text-dark hover:bg-gray-400"
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
                className="rounded-lg border border-gray-700 bg-gray-300 px-2 py-1 text-xs font-medium text-dark hover:bg-gray-400"
              >
                Add new room
              </button>
            </div>
          }
        />

        <hr className="my-2" />

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
            value={mobileNumber}
            handleChange={(e) =>
              setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
          />
        </div>

        <hr className="my-2" />

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
              <span className="font-semibold">
                {selectedRoom
                  ? `#${selectedRoom.number} (${selectedRoom.type})`
                  : "—"}
              </span>
            </div>
            <div className="text-md">
              <span>Guest:</span>{" "}
              {!firstName && !lastName && !mobileNumber ? (
                <span className="font-semibold">{"—"} </span>
              ) : (
                <span className="font-semibold">
                  {firstName} {lastName} {mobileNumber && `(${mobileNumber})`}
                </span>
              )}
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
