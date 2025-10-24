export function isAdminUser(user) {
  return user?.groups?.includes('super_admin') || user?.groups?.includes('admin');
}

export function hasRole(user, role) {
  return user?.roles?.includes(role);
}

export function hasAnyRole(user, roles) {
  return roles?.filter((r) => user?.roles?.includes(r)).length > 0;
}
