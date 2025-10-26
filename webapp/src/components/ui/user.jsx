import React from "react";
import { HotelRoleLabels } from "./roles";
import { DepartmentLabels } from "./department";
import { cn } from "@/lib/utils";

// Utility: generate a consistent color based on a string
function stringToColor(str) {
  if (!str) return "#9CA3AF"; // default gray
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 65%)`; // pastel-like color
}

// Utility: decide text color based on background brightness
function getTextColor(bgColor) {
  const [h, s, l] = bgColor
    .match(/\d+/g)
    .map((n, i) => (i === 2 ? parseInt(n) / 100 : parseInt(n)));
  return l > 0.55 ? "#1F2937" : "#FFFFFF"; // dark or white text
}

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
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const departmentLabels = showDepartment
    ? [department].filter(Boolean).map((d) => DepartmentLabels[department])
    : [];

  const combined = [...departmentLabels, ...roleLabels].join(", ");

  const bgColor = stringToColor(fullName);
  const textColor = getTextColor(bgColor);

  return (
    <div className={cn("flex items-center gap-3 rounded-lg p-3", width)}>
      {/* Avatar */}
      <div
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-semibold"
        style={{
          backgroundColor: imageUrl ? "transparent" : bgColor,
          color: textColor,
        }}
      >
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
