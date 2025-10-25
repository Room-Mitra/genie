export const HotelRoleLabels = {
  hotel_admin: "Admin",
  hotel_manager: "Manager",
  hotel_associate: "Associate",
  hotel_trainee: "Trainee",
  hotel_supervisor: "Supervisor",
};

export function Roles({ roles }) {
  return roles?.length ? (
    <span>{roles?.map((r) => HotelRoleLabels?.[r]).join(", ")}</span>
  ) : (
    <span>-</span>
  );
}
