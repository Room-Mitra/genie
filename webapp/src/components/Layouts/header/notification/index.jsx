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
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";

export function Notification({ reqsNeedAttention }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(reqsNeedAttention);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsDotVisible(reqsNeedAttention);
  }, [reqsNeedAttention]);

  const hasAttention = !!reqsNeedAttention;

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
      }}
    >
      <DropdownTrigger
        className={cn(
          "grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary",
          "dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary",
        )}
        aria-label="View Notifications"
      >
        <span className="relative inline-flex items-center justify-center">
          <motion.span
            animate={
              reqsNeedAttention
                ? { rotate: [0, -15, 10, -10, 5, -5, 0] }
                : { rotate: 0 }
            }
            transition={
              reqsNeedAttention
                ? { duration: 0.8, repeat: Infinity, repeatDelay: 2 }
                : { duration: 0.2 }
            }
            className="inline-flex items-center justify-center"
          >
            <Bell className="h-5 w-5" />
          </motion.span>

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
        className={cn(
          "min-w-[18rem] border border-stroke bg-white py-3 shadow-md",
          "dark:border-dark-3 dark:bg-gray-dark",
          "min-[350px]:min-w-[20rem]",
        )}
      >
        <div className="mb-1 flex items-center justify-between px-3 py-1.5">
          <span className="text-lg font-semibold text-dark dark:text-white">
            Notifications
          </span>
          {hasAttention && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-200">
              Needs attention
            </span>
          )}
        </div>

        <ul className="mb-2 max-h-[23rem] space-y-1.5 overflow-y-auto px-1.5">
          <li
            role="menuitem"
            className={cn(
              "rounded-md px-2 py-1.5 transition-colors",
              hasAttention
                ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                : "bg-gray-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-dark-3",
            )}
          >
            <Link
              onClick={() => setIsOpen(false)}
              href={hasAttention ? "/requests/active" : "#"}
              className={cn(
                "flex items-start gap-3 px-1 py-0.5 outline-none",
                "focus-visible:bg-gray-2 dark:focus-visible:bg-dark-3",
              )}
            >
              {/* Icon on the left */}
              <div className="mt-0.5 flex-shrink-0">
                {hasAttention ? (
                  <AlertTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                ) : (
                  <CheckCircle2Icon className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                )}
              </div>

              {/* Content */}
              {hasAttention ? (
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    Guest requests need attention
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Some requests are unacknowledged or delayed.
                  </p>
                  <span className="text-xs font-medium text-primary underline">
                    View active requests
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    All caught up
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    There are no guest requests needing attention right now.
                  </p>
                </div>
              )}
            </Link>
          </li>
        </ul>
      </DropdownContent>
    </Dropdown>
  );
}
