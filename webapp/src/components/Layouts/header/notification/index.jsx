"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BellIcon } from "./icons";

export function Notification({ reqsNeedAttention }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(reqsNeedAttention);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsDotVisible(reqsNeedAttention);
  }, [reqsNeedAttention]);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
      }}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {isDotVisible && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="px-3.5 text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          <li
            role="menuitem"
            className="bg-gray-2 px-3.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-dark-3"
          >
            <Link
              onClick={() => setIsOpen(false)}
              href={"/requests/active"}
              className="flex items-center gap-4 px-2 py-1.5 outline-none focus-visible:bg-gray-2 dark:focus-visible:bg-dark-3"
            >
              <div>
                <strong className="text-md block font-medium text-dark dark:text-white">
                  There are guest requests that need attention!
                </strong>
                <span className="text-sm font-medium underline">
                  View Unacknowledged or Delayed Requests
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
