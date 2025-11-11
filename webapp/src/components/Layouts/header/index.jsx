"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { Notification } from "./notification";
import { useRequests } from "@/context/RequestsContext";
import { useEffect, useState } from "react";
import SimpleChime from "@/components/Chime/chime";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const { activeRequests } = useRequests();

  const [reqsNeedAttention, setReqsNeedAttention] = useState(false);
  useEffect(() => {
    if (
      activeRequests?.filter((r) =>
        ["unacknowledged", "delayed", "new"].includes(r.status),
      )?.length
    ) {
      setReqsNeedAttention(true);
    } else {
      setReqsNeedAttention(false);
    }
  }, [activeRequests]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 dark:border-stroke-dark dark:bg-gray-dark md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-slate-950 hover:dark:bg-[#FFFFFF1A]"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <ThemeToggleSwitch />

        <Notification reqsNeedAttention={reqsNeedAttention} />

        <SimpleChime playing={reqsNeedAttention} />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
