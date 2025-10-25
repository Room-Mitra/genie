import React, { useMemo, useRef, useState, useEffect } from "react";

// type RequestStatus = "UNACKNOWLEDGED" | "IN_PROGRESS" | "DELAYED" | "COMPLETED";

// type ActionButtonProps = {
//   status: RequestStatus;
//   // Callbacks (wire these to open modals or run mutations)
//   onStart?: () => void;      // Unacknowledged → In Progress
//   onDelay?: () => void;      // In Progress → Delayed
//   onResume?: () => void;     // Delayed → In Progress
//   onComplete?: () => void;   // Any → Completed
//   className?: string;
// };

export function ActionButton({
  status,
  onStart,
  onDelay,
  onResume,
  onComplete,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = (useRef < HTMLDivElement) | (null > null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const actions = useMemo(() => {
    if (status === "unacknowledged") {
      return [{ label: "Start", intent: "primary", onClick: onStart }];
    }
    if (status === "in_progress") {
      return [
        { label: "Complete", intent: "success", onClick: onComplete },
        { label: "Delay", intent: "warning", onClick: onDelay },
      ];
    }
    if (status === "delayed") {
      return [
        { label: "Resume", intent: "primary", onClick: onResume },
        { label: "Complete", intent: "success", onClick: onComplete },
      ];
    }
    return []; // COMPLETED
  }, [status, onStart, onDelay, onResume, onComplete]);

  if (status === "completed") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
        Completed
      </span>
    );
  }

  // Single action: render one button
  if (actions.length === 1) {
    const a = actions[0];
    return (
      <button
        onClick={a.onClick}
        className={[
          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
          a.intent === "primary" &&
            "bg-pink-600 text-white hover:bg-pink-700 focus:ring-indigo-500",
          a.intent === "success" &&
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
          a.intent === "warning" &&
            "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500",
          className,
        ].join(" ")}
      >
        {a.label}
      </button>
    );
  }

  // Multiple actions: split button + menu
  const [primary, ...rest] = actions;

  return (
    <div ref={menuRef} className={`relative inline-flex ${className}`}>
      <button
        onClick={primary.onClick}
        className={[
          "inline-flex items-center rounded-l-md px-3 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
          primary.intent === "primary" &&
            "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
          primary.intent === "success" &&
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
          primary.intent === "warning" &&
            "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500",
        ].join(" ")}
      >
        {primary.label}
      </button>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "inline-flex items-center rounded-r-md border-l border-white/20 px-2.5 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
          primary.intent === "primary" &&
            "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
          primary.intent === "success" &&
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
          primary.intent === "warning" &&
            "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500",
        ].join(" ")}
        title="More actions"
      >
        ▾
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black/5"
        >
          {rest.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setOpen(false);
                a.onClick?.();
              }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              role="menuitem"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
