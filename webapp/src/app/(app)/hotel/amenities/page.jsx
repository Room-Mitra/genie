"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { FacilityUploadForm } from "../_components/facility-upload";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import { Spinner } from "@material-tailwind/react";
import { DeleteButton } from "@/components/ui/delete-button";
import { DeleteModal } from "@/components/ui/delete-modal";

async function fetchAmenities() {
  const res = await fetch("/api/hotel/amenities", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("failed to fetch amenities");
  return await res.json();
}

async function deleteAmenity(amenityId) {
  const res = await fetch(`/api/hotel/amenities/${amenityId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("failed to delete amenity");
  return await res.json();
}

export default function Page() {
  const [showAddFacility, setShowAddFacility] = useState(false);

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [amenityToDelete, setAmenityToDelete] = useState(null);

  const refreshAmenities = async () => {
    setLoading(true);
    try {
      const am = await fetchAmenities();
      setAmenities(am.items);
    } catch (err) {
      toast.error(err?.message || "Error fetching amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (amenityId) => {
    try {
      await deleteAmenity(amenityId);

      toast.success("Deleted amenity");
      refreshAmenities();
    } catch (err) {
      toast.error(err?.message || "Failed to delete amenity");
    } finally {
      setShowDeleteModal(false);
      setAmenityToDelete(null);
    }
  };

  useEffect(() => {
    refreshAmenities();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumb pageName="Amenities" parent="Hotel" />

      <div className="mb-5 mt-2 flex items-center justify-end gap-3">
        <button
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          onClick={() => setShowAddFacility(true)}
        >
          + New Amenity
        </button>
      </div>

      {!loading && !amenities.length && !showAddFacility && (
        <div className="rounded-[10px] bg-gray-200 p-6 dark:bg-gray-dark">
          No amenities added
        </div>
      )}

      {showAddFacility && (
        <FacilityUploadForm
          onCancel={() => setShowAddFacility((prev) => !prev)}
          entityType="AMENITY"
          refresh={() => refreshAmenities()}
        />
      )}

      {loading && (
        <div className="my-5 rounded-[10px] bg-white p-6 dark:bg-gray-dark">
          <div className="mx-auto my-5 mb-5.5 flex w-fit flex-col gap-5 sm:flex-row">
            <Spinner />
          </div>
        </div>
      )}

      {amenities.length ? (
        amenities.map((a, i) => (
          <div
            key={i}
            className="my-5 rounded-[10px] bg-white p-6 dark:bg-gray-dark"
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="mt-1 w-full sm:w-[33%]">
                <div className="relative overflow-hidden rounded-xl border border-stroke dark:border-dark-3">
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: "4 / 1" }}
                  >
                    <Image
                      src={a?.headerImage?.url}
                      alt="Selected facility"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      priority
                    />
                  </div>
                </div>
              </div>
              <div className="grid h-fit w-full gap-4 sm:ml-8 sm:w-[66%]">
                <span className="text-body-md font-medium text-dark dark:text-white/80">
                  Title
                </span>
                <span className="text-2xl font-bold text-dark dark:text-white">
                  {a.title}
                </span>
                <span className="text-body-md font-medium text-dark dark:text-white/80">
                  Description
                </span>
                <span className="text-xl font-bold text-dark dark:text-white">
                  {a.description}
                </span>
              </div>
              <div>
                <DeleteButton
                  onClick={() => {
                    setAmenityToDelete(a);
                    setShowDeleteModal(true);
                  }}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <></>
      )}

      <DeleteModal
        showModal={showDeleteModal}
        onClose={() => {
          setAmenityToDelete(null);
          setShowDeleteModal(false);
        }}
        message={
          <div className="px-6">
            <div className="pb-2 pt-6 font-bold">
              Are you sure you want to delete amenity?
            </div>
            <div className="pb-4">{amenityToDelete?.title}</div>
          </div>
        }
        header={"Delete amenity"}
        onConfirmDelete={async () =>
          await handleDelete(amenityToDelete.amenityId)
        }
      />
    </div>
  );
}
