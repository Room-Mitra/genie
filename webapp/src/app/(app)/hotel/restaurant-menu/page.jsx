import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export const metadata = {
  title: "Hotel Info",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb pageName="Restaurant Menu" parent="Hotel" />
    </div>
  );
}
