import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { RoomsGrid } from "@/components/Rooms/grid";
import { getTokenFromCookie } from "@/lib/auth";

async function fetchRooms() {
  const token = await getTokenFromCookie();
  const res = await fetch(`${process.env.API_BASE_URL}/rooms`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch rooms");
  }

  return await res.json();
}

export default async function Home() {
  const rooms = await fetchRooms();

  return (
    <div>
      <Breadcrumb pageName="Rooms" parent="Dashboard" />
      <div className="w-full rounded-[10px] bg-white p-6 dark:bg-gray-dark lg:w-full">
        <RoomsGrid rooms={rooms.items} />
      </div>
    </div>
  );
}
