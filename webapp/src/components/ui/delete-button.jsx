import { TrashIcon } from "@/assets/icons";

export function DeleteButton({ onClick }) {
  return (
    <div className="group relative inline-block">
      <TrashIcon
        width={20}
        height={20}
        className="cursor-pointer hover:fill-black/40 dark:hover:fill-white/80"
        onClick={onClick}
      />

      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
        Delete
      </span>
    </div>
  );
}
