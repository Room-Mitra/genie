import React from "react";
import { HotelRoleLabels } from "./roles";
import { DepartmentLabels } from "./department";
import { cn } from "@/lib/utils";
import { Avatar } from "../Avatar/avatar";

export default function User({
  user,
  showRoles = false,
  showDepartment = false,
  showEmail = false,
  showMobileNumber = false,
  width = "w-60",
}) {
  if (!user) return null;

  const { firstName, lastName, department, roles = [], imageUrl } = user;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const roleLabels = showRoles
    ? roles.filter(Boolean).map((r) => HotelRoleLabels[r])
    : [];

  const departmentLabels = showDepartment
    ? [department].filter(Boolean).map((d) => DepartmentLabels[department])
    : [];

  const combined = [...departmentLabels, ...roleLabels].join(", ");

  return (
    <div className={cn("flex items-center gap-3 rounded-lg p-3", width)}>
      <Avatar name={fullName} fallback={"U"} url={imageUrl} size={36} />

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
        {showEmail && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </div>
        )}
        {showMobileNumber && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user?.mobileNumber}
          </div>
        )}
      </div>
    </div>
  );
}
