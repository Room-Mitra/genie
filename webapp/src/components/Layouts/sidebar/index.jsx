"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { useRequests } from "@/context/RequestsContext";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState([]);

  const { activeRequests } = useRequests();

  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [hasDelayedOrUnacknowledged, setHasDelayedOrUnacknowledged] =
    useState(false);

  useEffect(() => {
    setActiveRequestsCount(activeRequests.length ?? 0);

    setHasDelayedOrUnacknowledged(
      activeRequests?.filter(
        (r) => r.status === "unacknowledged" || r.status === "delayed",
      )?.length > 0,
    );
  }, [activeRequests]);

  const toggleExpanded = useCallback((title) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  }, []);

  // Keep collapsible open when its subpage is active
  useEffect(() => {
    NAV_DATA.forEach((section) => {
      section.items.forEach((item) => {
        if (!item.items?.length) return;

        const hasActiveChild = item.items.some(
          (subItem) => subItem.url === pathname,
        );
        if (hasActiveChild) {
          setExpandedItems((prev) =>
            prev.includes(item.title) ? prev : [...prev, item.title],
          );
        }
      });
    });
  }, [pathname]);

  // Helper to avoid flicker: do not toggle if this group is already active
  const handleParentClick = (itemTitle, hasActiveChild) => {
    if (hasActiveChild) return; // prevent close+reopen flicker
    toggleExpanded(itemTitle);
  };

  // Shared badge class using your existing coloring logic
  const badgeClass = hasDelayedOrUnacknowledged
    ? "bg-red-600/90 text-white"
    : "bg-yellow-500 text-white";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>

                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => {
                      const hasChildren = item.items && item.items.length > 0;

                      if (hasChildren) {
                        const hasActiveChild = item.items.some(
                          ({ url }) => url === pathname,
                        );
                        const isExpanded = expandedItems.includes(item.title);

                        // Identify the Requests group (the one that contains /requests/active)
                        const isRequestsGroup = item.items.some(
                          (subItem) => subItem.url === "/requests/active",
                        );

                        return (
                          <li key={item.title}>
                            <div>
                              <MenuItem
                                isActive={hasActiveChild}
                                onClick={() =>
                                  handleParentClick(item.title, hasActiveChild)
                                }
                              >
                                <item.icon
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />

                                <span >
                                  {item.title}
                                </span>

                                {/* Badge on parent only when not expanded */}
                                {isRequestsGroup &&
                                  !isExpanded &&
                                  activeRequestsCount > 0 && (
                                    <span
                                      className={cn(
                                        "inline-flex min-w-[1.5rem] items-center justify-start rounded-full px-2 py-0.5 text-xs font-semibold",
                                        badgeClass,
                                      )}
                                    >
                                      {activeRequestsCount}
                                    </span>
                                  )}

                                <ChevronUp
                                  className={cn(
                                    "ml-1 rotate-180 transition-transform justify-end duration-200",
                                    isExpanded && "rotate-0",
                                  )}
                                  aria-hidden="true"
                                />
                              </MenuItem>

                              {isExpanded && (
                                <ul
                                  className="ml-9 mr-0 space-y-1.5 pb-[15px] pr-0 pt-2"
                                  role="menu"
                                >
                                  {item.items.map((subItem) => {
                                    const isSubActive =
                                      pathname === subItem.url;
                                    const isActiveRequests =
                                      subItem.url === "/requests/active";

                                    return (
                                      <li key={subItem.title} role="none">
                                        <MenuItem
                                          as="link"
                                          href={subItem.url}
                                          isActive={isSubActive}
                                        >
                                          <span className="flex w-full items-center justify-between">
                                            <span>{subItem.title}</span>

                                            {isActiveRequests &&
                                              activeRequestsCount > 0 && (
                                                <span
                                                  className={cn(
                                                    "ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                                    badgeClass,
                                                  )}
                                                >
                                                  {activeRequestsCount}
                                                </span>
                                              )}
                                          </span>
                                        </MenuItem>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </li>
                        );
                      }

                      // Items without children
                      const href =
                        "url" in item
                          ? item.url
                          : "/" + item.title.toLowerCase().split(" ").join("-");

                      return (
                        <li key={item.title}>
                          <MenuItem
                            className="flex items-center gap-3 py-3"
                            as="link"
                            href={href}
                            isActive={pathname === href}
                          >
                            <item.icon
                              className="size-6 shrink-0"
                              aria-hidden="true"
                            />

                            <span>{item.title}</span>
                          </MenuItem>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
