import { useEffect, useRef, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export function Details({ details, title = "Details" }) {
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const t = e.target;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return details ? (
    <div className="relative inline-block">
      <button
        type="button"
        ref={btnRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="popover-details"
        className="mt-1.5 inline-flex items-center"
      >
        <InformationCircleIcon className="size-6 cursor-pointer text-gray-600 hover:text-gray-400 dark:text-white dark:hover:text-gray-400" />
        <span className="sr-only">Show details</span>
      </button>

      {open && (
        <div
          id="popover-details"
          ref={popRef}
          role="dialog"
          className="absolute z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          // Position: align start below the icon. Adjust as needed.
          style={{ left: 0 }}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-4 h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />

          <div className="rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2 font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
            {title}
          </div>

          <div className="px-3 py-2">
            {/* Render string or JSX/object safely */}
            {typeof details === "string" ? (
              <p>{details}</p>
            ) : (
              <pre className="whitespace-pre-wrap break-words text-xs opacity-90">
                {JSON.stringify(details, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}
