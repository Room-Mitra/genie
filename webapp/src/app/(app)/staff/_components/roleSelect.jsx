import { Select } from "@/components/FormElements/select";

export function RoleSelect({ value, handleChange, required }) {
  return (
    <Select
      label="Role"
      items={[
        { label: "Admin", value: "hotel_admin" },
        { label: "Manager", value: "hotel_manager" },
        { label: "Supervisor", value: "hotel_supervisor" },
        { label: "Associate", value: "hotel_associate" },
        { label: "Trainee", value: "hotel_trainee" },
      ]}
      placeholder="Associate"
      handleChange={handleChange}
      required={required}
      value={value}
    />
  );
}
