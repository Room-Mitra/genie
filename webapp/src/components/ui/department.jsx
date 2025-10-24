export function Department({ department }) {
  const labels = {
    house_keeping: "House Keeping",
    room_service: "Room Service",
    front_office: "Front Office",
    concierge: "Concierge",
    facilities: "Facilities",
  };

  return department ? <span>{labels[department]}</span> : <span>-</span>;
}
