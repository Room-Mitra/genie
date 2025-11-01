import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * MultiSelectGroup (JSX)
 *
 * Props:
 * - label?:        string
 * - name?:         string (used for accessibility ids)
 * - required?:     boolean
 * - helperText?:   string
 * - error?:        string | boolean
 * - options:       [{ label: string, value: string | number, disabled?: boolean }]
 * - value?:        array of values for controlled usage
 * - defaultValue?: array of values for uncontrolled initial selection
 * - onChange?:     (selectedOptionsArray) => void
 * - placeholder?:  string
 * - disabled?:     boolean
 * - className?:    string
 */
export function MultiSelectGroup({
  label,
  name,
  required = false,
  helperText,
  error,
  options = [],
  value,
  defaultValue = [],
  onChange,
  placeholder = "Select…",
  disabled = false,
  className = "",
}) {
  const inputId = useMemo(
    () => `${name || "multiselect"}-${Math.random().toString(36).slice(2, 8)}`,
    [name],
  );

  const isControlled = Array.isArray(value);
  const [open, setOpen] = useState(false);
  const [internalValues, setInternalValues] = useState(defaultValue);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Sync internal state when controlled
  useEffect(() => {
    if (isControlled) setInternalValues(value);
  }, [isControlled, value]);

  const selectedValues = isControlled ? value : internalValues;

  const byValue = useMemo(() => {
    const map = new Map();
    for (const opt of options) map.set(opt.value, opt);
    return map;
  }, [options]);

  const selectedOptions = useMemo(
    () => (selectedValues || []).map((v) => byValue.get(v)).filter(Boolean),
    [selectedValues, byValue],
  );

  const emitChange = (nextValues) => {
    const nextSelectedOptions = nextValues
      .map((v) => byValue.get(v))
      .filter(Boolean);
    onChange && onChange(nextSelectedOptions);
  };

  const setValues = (updater) => {
    if (isControlled) {
      const next =
        typeof updater === "function" ? updater(selectedValues || []) : updater;
      emitChange(next);
    } else {
      setInternalValues((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        emitChange(next);
        return next;
      });
    }
  };

  const toggleValue = (v) => {
    setValues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const clearAll = (e) => {
    e.stopPropagation();
    setValues([]);
  };

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick, true);
    return () => document.removeEventListener("mousedown", onDocClick, true);
  }, []);

  // Keyboard
  const onKeyDown = (e) => {
    if (disabled) return;
    if ((e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const baseBorder = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-dark-5 focus:border-primary";
  const helperTextColor = error ? "text-red-600" : "text-gray-500";

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-4 block text-body-sm font-medium text-dark dark:text-white"
        >
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}

      {/* Trigger styled like an input */}
      <button
        id={inputId}
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`relative min-h-10 w-full rounded-lg border bg-white px-3 py-2 text-left outline-none dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${baseBorder} `}
      >
        {/* Chips or placeholder */}
        {selectedOptions.length === 0 ? (
          <span className="text-body-sm text-dark-6">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap items-center gap-1 pr-12">
            {selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-100 px-2 py-1 text-sm text-indigo-700 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
              >
                {opt.label}
                <span
                  type="button"
                  className="rounded-full px-1 text-indigo-700 hover:bg-indigo-100 dark:text-white dark:hover:bg-gray-700"
                  aria-label={`Remove ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(opt.value);
                  }}
                >
                  ×
                </span>
              </span>
            ))}
            <span
              type="button"
              onClick={clearAll}
              className="ml-auto text-xs text-gray-600 underline hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-500"
              aria-label="Clear all"
              onMouseDown={(e) => e.stopPropagation()}
            >
              Clear
            </span>
          </div>
        )}

        {/* Chevron indicator */}
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M5 7l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div role="listbox" aria-multiselectable="true" className="relative">
          <div className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-md dark:border-dark-3 dark:bg-dark-2">
            {options.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No options</div>
            ) : (
              <ul className="py-1">
                {options.map((opt) => {
                  const checked = selectedValues?.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={checked}
                      aria-disabled={!!opt.disabled}
                      onClick={() => !opt.disabled && toggleValue(opt.value)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm ${opt.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"}`}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={!!checked}
                        className="h-4 w-4"
                      />
                      <span className="text-dark dark:text-white">
                        {opt.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Helper or error text */}
      {(helperText || error) && (
        <p className={`mt-1 text-xs ${helperTextColor}`}>
          {error && typeof error === "string" ? error : helperText}
        </p>
      )}
    </div>
  );
}
