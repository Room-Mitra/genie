import InputGroup from "@/components/FormElements/InputGroup";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function Autocomplete({
  label,
  placeholder,
  value,
  onSelect,
  fetcher,
  renderItem,
  getDisplayValue,
  noResultsContent,
  rightAddon,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ? getDisplayValue(value) : "");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);
  const wrapperRef = useRef(null);

  const debounced = useDebounce(query, 200);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetcher(debounced);
        if (!alive) return;
        setItems(res);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (open) load();
    return () => {
      alive = false;
    };
  }, [debounced, fetcher, open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery(value ? getDisplayValue(value) : "");
  }, [value, getDisplayValue]);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        const chosen = items[activeIndex];
        onSelect?.(chosen);
        setQuery(getDisplayValue(chosen));
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="w-full" ref={wrapperRef}>
      <div className="relative">
        <InputGroup
          label={label}
          placeholder={placeholder}
          value={query}
          handleChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {rightAddon && (
          <div className="absolute inset-y-0 right-2 flex items-center align-middle">
            {rightAddon}
          </div>
        )}

        {open && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">
            {loading ? (
              <div className="p-3 text-sm text-gray-400">Searching...</div>
            ) : items.length > 0 ? (
              <ul ref={listRef} className="max-h-64 overflow-auto py-1">
                {items.map((it, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "cursor-pointer px-3 py-2 text-sm text-gray-100 hover:bg-gray-800",
                      idx === activeIndex && "bg-gray-800",
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect?.(it);
                      setQuery(getDisplayValue(it));
                      setOpen(false);
                    }}
                  >
                    {renderItem(it)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-sm text-gray-400">
                {noResultsContent || "No matches"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
