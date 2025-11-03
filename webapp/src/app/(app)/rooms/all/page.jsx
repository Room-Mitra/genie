"use client";

import { TrashIcon } from "@/assets/icons";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DateTime } from "@/components/ui/datetime";
import { DeleteButton } from "@/components/ui/delete-button";
import { DeleteModal } from "@/components/ui/delete-modal";
import { ID } from "@/components/ui/id";
import { Room } from "@/components/ui/room";
import SortTable from "@/components/ui/sort-table";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

async function fetchRooms() {
  const res = await fetch("/api/rooms", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch rooms");
  }

  return await res.json();
}

export default function Page() {
  const [data, setData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { key: "roomId", label: "ROOM ID" },
      { key: "room", label: "ROOM" },
      { key: "description", label: "DESCRIPTION" },
      { key: "createdAt", label: "CREATED AT" },
      { key: "delete", label: "", sortable: false },
    ],
    [],
  );

  const refreshRooms = async () => {
    setLoading(true);
    try {
      const rooms = await fetchRooms();
      setData(
        rooms?.items?.map((r) => ({
          roomId: <ID ulid={r.roomId} size="xs" />,
          room: <Room room={r} wide={true} />,
          number: (
            <span className="text-md inline-block rounded-full bg-cyan-600 px-3 py-2 text-white">
              #{r.number}
            </span>
          ),
          type: <span className="text-dark dark:text-gray-200">{r.type}</span>,
          floor: (
            <div className="text-md align-middle text-dark dark:text-gray-200">
              {r.floor}
            </div>
          ),
          description: (
            <div className="inline-flex max-w-[350px]">{r.description}</div>
          ),
          createdAt: <DateTime dateTimeIso={r.createdAt} />,
          delete: (
            <DeleteButton
              onClick={() => {
                setRoomToDelete(r);
                setShowDeleteModal(true);
              }}
            />
          ),
        })),
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRooms();
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

  return (
    <div>
      <Breadcrumb pageName="All Rooms" parent="Rooms" />
      <div className="mb-5 mt-2 flex items-center justify-end gap-3">
        <Link
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          href="/rooms/new"
        >
          + New Room
        </Link>
      </div>
      <div className="w-fit rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <SortTable
          columns={columns}
          data={data}
          tableRowClassNames={[
            "text-base font-medium text-dark dark:text-white",
          ]}
          noDataMessage="No rooms available"
          loading={loading}
        />

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
    </div>
  );
}
