"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { FacilityUploadForm } from "../_components/facility-upload";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import { Spinner } from "@material-tailwind/react";

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
  const [deleting, setDeleting] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAmenities = async () => {
    setLoading(true);
    try {
      const am = await fetchAmenities();
      setAmenities(am.items);
      setDeleting(new Array(am.count).fill(false));
    } catch (err) {
      toast.error(err?.message || "Error fetching amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (i, amenityId) => {
    const d = new Array(amenities.length).fill(false);
    d[i] = true;
    setDeleting(d);
    try {
      await deleteAmenity(amenityId);
      toast.success("Deleted amenity");
      refreshAmenities();
    } catch (err) {
      toast.error(err?.message || "Failed to delete amenity");
    } finally {
      d[i] = false;
      setDeleting(d);
    }
  };

  useEffect(() => {
    refreshAmenities();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Amenities" parent="Hotel" />

      <div className="mb-5 mt-2 flex items-center justify-end gap-3">
        <button
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          onClick={() => setShowAddFacility(true)}
        >
          + Add
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
                  <div className="relative h-64 w-full">
                    <Image
                      src={a.image.url}
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
                {deleting[i] ? (
                  <Spinner />
                ) : (
                  <TrashIcon
                    width={25}
                    height={25}
                    className="hover:fill-black/40 dark:hover:fill-white/80"
                    onClick={() => handleDelete(i, a.amenityId)}
                  />
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
