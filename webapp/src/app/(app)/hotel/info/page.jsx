import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { HotelInfoForm } from "./_components/hotel-info";

export const metadata = {
  title: "Hotel Info",
};

export default async function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Info" parent="Hotel" />
      <HotelInfoForm />
    </div>
  );
}
