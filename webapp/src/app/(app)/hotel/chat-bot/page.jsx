"use client";
import { useUser } from "@/context/UserContext";
import DomainConfig from "../_components/domain-config";
import ConversationRecipients from "../_components/conversation-recipients";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function HotelDomainsPage() {
  const { user } = useUser();

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Vaani - Chat Bot" parent="Dashboard" />

      <div className="p-6">
        <ConversationRecipients hotelId={user?.hotelId} />
      </div>

      <div className="p-6">
        <DomainConfig hotelId={user?.hotelId} />
      </div>
    </div>
  );
}
