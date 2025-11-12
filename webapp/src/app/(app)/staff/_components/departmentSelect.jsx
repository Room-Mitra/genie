import { Select } from "@/components/FormElements/select";

export function DepartmentSelect({ value, handleChange, required }) {
  return (
    <Select
      label="Department"
      items={[
        { label: "House Keeping", value: "house_keeping" },
        { label: "Room Service", value: "room_service" },
        { label: "Front Office", value: "front_office" },
        { label: "Concierge", value: "concierge" },
        { label: "Facilities", value: "facilities" },
      ]}
      placeholder="Room Service"
      handleChange={handleChange}
      required={required}
      value={value}
    />
  );
}
