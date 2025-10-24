"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { ID } from "@/components/ui/id";
import { User } from "@/components/Layouts/sidebar/icons";

export default function Page() {
  const { user } = useUser();

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative h-35 md:h-65">
          <Image
            src={"/images/cover/cover-01.png"}
            alt="profile cover"
            className="h-full w-full rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3">
            <div className="relative drop-shadow-2">
              <User width={150} height={150} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {user?.firstName} {user?.lastName}
            </h3>
            <div>{user?.email}</div>

            <div className="mx-auto inline-flex w-[50%] justify-center">
              <div className="flex w-fit">
                <span className="m-4 font-bold">USER ID: </span>
                <ID ulid={user?.userId} />
              </div>
              <div className="flex">
                <span className="m-4 font-bold">HOTEL ID: </span>
                <ID ulid={user?.hotelId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
