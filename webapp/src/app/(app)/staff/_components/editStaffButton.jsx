import { EditIcon } from "lucide-react";

export function EditStaffButton({ onClick }) {
  return (
    <div className="group relative inline-block">
      <EditIcon
        width={18}
        height={18}
        className="cursor-pointer text-black/90 hover:text-black/40 dark:text-white dark:hover:text-white/60"
        onClick={onClick}
      />

      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
        Edit staff details
      </span>
    </div>
  );
}
