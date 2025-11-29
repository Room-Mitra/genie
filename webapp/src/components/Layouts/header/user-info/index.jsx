"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import User from "@/components/ui/user";

async function logout() {
  try {
    await fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    window.location.assign("/login");
  } catch (err) {
    toast.error("Error logging out user" + (err?.message && `: ${err.message}`));
  }
}

async function updateOnDuty(onDuty, userId) {
  const res = await fetch("/api/staff/duty", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, onDuty, trigger: "manual" }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(text || "Failed to update onDuty");
  }

  return res.json(); // { success: true, onDuty: boolean } on success
}

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setOnDuty } = useUser(); // we added setUser to context
  const isOnDuty = user?.onDuty ?? false;
  // handle toggle change with optimistic update
  const handleToggle = async () => {
    const nextValue = !isOnDuty;
    if (!user) return;

    // Optimistic update: remember old value so we can revert if API fails
    const prev = user.onDuty;

    // update UI immediately
    setOnDuty(nextValue);

    try {
      await updateOnDuty(nextValue, user.userId);
      toast.success(`You are now ${nextValue ? "On Duty" : "Off Duty"}`);
    } catch (err) {
      // revert on failure
      setOnDuty(prev);
      console.error("Failed to update onDuty", err);
      toast.error("Failed to update duty status");
    }
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <div className="flex items-center gap-3">
          <div>
            <User user={user} width="w-50" />
          </div>
          <div className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <User user={user} showEmail={true} />

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />
            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        {/* --- DUTY TOGGLE --- */}
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <span
              className={cn(
                "font-semibold text-sm",
                isOnDuty ? "text-green-600" : "text-red-600"
              )}
            >
              {isOnDuty ? "ON DUTY" : "OFF DUTY"}
            </span>

            {/* Toggle UI */}
            <button
              onClick={handleToggle}
              className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
                isOnDuty ? "bg-green-500" : "bg-gray-400"
              )}
            >
              <span
                className={cn(
                  "inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform",
                  isOnDuty ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3 my-1" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 dark:hover:bg-dark-3"
          >
            <UserIcon />
            <span className="mr-auto font-medium">View profile</span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={() => {
              logout();
            }}
          >
            <LogOutIcon />
            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
