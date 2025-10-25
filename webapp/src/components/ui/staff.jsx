import React from "react";
import { HotelRoleLabels } from "./roles";
import { DepartmentLabels } from "./department";

export default function Staff({ user }) {
  if (!user) return null;

  const { firstName, lastName, department, roles = [], imageUrl } = user;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const roleLabels = roles.filter(Boolean).map((r) => HotelRoleLabels[r]);
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const departmentLabels = [department]
    .filter(Boolean)
    .map((d) => DepartmentLabels[department]);

  const combined = [...departmentLabels, ...roleLabels].join(", ");
  return (
    <div className="flex w-[100%] mx-auto items-center gap-3 rounded-lg bg-white p-3">
      {/* Avatar */}
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold text-gray-600">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Details */}
      <div>
        <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {fullName || "Unnamed User"}
        </div>
        {combined && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {combined}
          </div>
        )}
      </div>
    </div>
  );
}
