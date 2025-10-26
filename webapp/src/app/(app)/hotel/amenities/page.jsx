"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { FacilityUploadForm } from "../_components/facility-upload";
import { useState } from "react";

export default function Page() {
  const [showAddFacility, setShowAddFacility] = useState(false);

  const [amenities, setAmenities] = useState([]);

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Amenities" parent="Hotel" />

      <div className="mb-5 mt-2 flex items-center justify-end gap-3">
        <button
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          onClick={() => setShowAddFacility((prev) => !prev)}
        >
          + Add
        </button>
      </div>

      {!amenities.length && !showAddFacility && (
        <div className="rounded-[10px] bg-gray-200 p-6 dark:bg-gray-dark">
          No amenities added yet
        </div>
      )}

      {showAddFacility && (
        <FacilityUploadForm
          onCancel={() => setShowAddFacility((prev) => !prev)}
        />
      )}
    </div>
  );
}
