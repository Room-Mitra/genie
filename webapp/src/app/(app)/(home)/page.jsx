"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { RoomsGrid } from "@/components/Rooms/grid";

export default function Home() {
  return (
    <div>
      <Breadcrumb pageName="Rooms" parent="Dashboard" />
      <div className="w-full rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <RoomsGrid />
      </div>
    </div>
  );
}
