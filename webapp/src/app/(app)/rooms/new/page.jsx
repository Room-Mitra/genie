"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

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

export default function AddRoomPage() {
  const [savingRoom, setSavingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "",
    floor: "",
    description: "",
  });

  const canSubmit = useMemo(() => {
    return roomForm.number && roomForm.type && roomForm.floor && !savingRoom;
  }, [roomForm.number, roomForm.type, roomForm.floor, savingRoom]);

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
      await addRoom({
        roomNumber: roomForm.number,
        roomType: roomForm.type,
        floor: roomForm.floor,
        description: roomForm.description,
      });

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
          Add Room
        </h2>
        <p className="text-md mt-1 text-dark dark:text-gray-300">
          Create a room with number, type, floor and description.
        </p>
      </div>

      <form onSubmit={handleSaveRoomSubmit} className="grid gap-4">
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
            type="submit"
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              savingRoom || !canSubmit
                ? "bg-gray-700 text-gray-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500",
            )}
            disabled={savingRoom || !canSubmit}
          >
            {savingRoom ? "Saving..." : "Save room"}
          </button>
        </div>
      </form>
    </div>
  );
}
