import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { HotelInfoForm } from "./_components/hotel-info";

export const metadata = {
  title: "Hotel Info",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Hotel Info" />
      <HotelInfoForm />
    </div>
  );
}
