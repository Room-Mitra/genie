export function isAdminUser(user) {
  return user?.groups?.includes('super_admin') || user?.groups?.includes('admin');
}

export function hasRole(user, role) {
  return user?.roles?.includes(role);
}
