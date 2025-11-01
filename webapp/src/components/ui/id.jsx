"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export function ID({ ulid, size }) {
  const [copied, setCopied] = useState(false);

  const sizeToText = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-md",
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(ulid);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy ULID:", err);
    }
  };

  return ulid ? (
    <div
      className={cn(
        "mx-auto w-fit flex items-center text-gray-500 dark:text-gray-400",
        sizeToText[size ?? "md"],
      )}
    >
      <span className="font-mono">{ulid?.slice(0, 8)}</span>

      <button
        type="button"
        onClick={handleCopy}
        className="group relative p-1 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Copy ULID"
      >
        {/* Tooltip */}
        <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block">
          {copied ? "Copied" : "Copy ID"}
        </span>

        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  ) : (
    <span> --- </span>
  );
}
