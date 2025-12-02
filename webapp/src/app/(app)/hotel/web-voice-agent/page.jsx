"use client";
import { useUser } from "@/context/UserContext";
import DomainConfig from "../_components/domain-config";

export default function HotelDomainsPage() {
  const { user } = useUser();

  return (
    <main className="p-6">
      <DomainConfig hotelId={user?.hotelId} />
    </main>
  );
}
