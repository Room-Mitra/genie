export function Roles({ roles }) {
  const labels = {
    hotel_admin: "Admin",
    hotel_manager: "Manager",
    hotel_associate: "Associate",
    hotel_trainee: "Trainee",
    hotel_supervisor: "Supervisor",
  };

  return roles?.length ? (
    <span>{roles?.map((r) => labels?.[r]).join(", ")}</span>
  ) : (
    <span>-</span>
  );
}
