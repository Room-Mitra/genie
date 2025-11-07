import { TrashIcon } from "@/assets/icons";

export function DeleteButton({ onClick, noToolTip }) {
  return (
    <div className="group relative inline-block">
      <TrashIcon
        width={20}
        height={20}
        className="cursor-pointer text-black/90 hover:text-black/40 dark:text-white dark:hover:text-white/60"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
      />

      {/* Tooltip */}
      {!noToolTip && (
        <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
          Delete
        </span>
      )}
    </div>
  );
}
