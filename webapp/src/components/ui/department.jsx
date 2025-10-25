export const DepartmentLabels = {
  house_keeping: "House Keeping",
  room_service: "Room Service",
  front_office: "Front Office",
  concierge: "Concierge",
  facilities: "Facilities",
};

export function Department({ department, reqType }) {
  return department ? (
    <div className="flex flex-col">
      <span>{DepartmentLabels[department]}</span>
      {reqType ? <span>↳ {reqType}</span> : <></>}
    </div>
  ) : (
    <span>-</span>
  );
}
