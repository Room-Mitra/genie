export const DepartmentLabels = {
  house_keeping: "House Keeping",
  room_service: "Room Service",
  front_office: "Front Office",
  concierge: "Concierge",
  facilities: "Facilities",
};

export function Department({ department }) {
  return department ? (
    <span>{DepartmentLabels[department]}</span>
  ) : (
    <span>-</span>
  );
}
