import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MenuManager from "@/components/Menu/menu";

export const metadata = {
  title: "Hotel Info",
};

export default function Page() {
  return (
    <div>
      <Breadcrumb pageName="Restaurant Menu" parent="Hotel" />
      <MenuManager />
    </div>
  );
}
