import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { HotelInfoForm } from "./_components/hotel-info";
import { getTokenFromCookie } from "@/lib/auth";

export const metadata = {
  title: "Hotel Info",
};

async function getHotelInfoServer() {
  const token = await getTokenFromCookie();
  const res = await fetch(`${process.env.API_BASE_URL}/hotel`, {
    method: "GET",
    // No need for credentials when calling your own route on the server,
    // unless you specifically read cookies there — then forward them.
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch hotel");
  return res.json();
}

export default async function Page() {
  const hotel = await getHotelInfoServer();
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Info" parent="Hotel" />
      <HotelInfoForm hotel={hotel} />
    </div>
  );
}
