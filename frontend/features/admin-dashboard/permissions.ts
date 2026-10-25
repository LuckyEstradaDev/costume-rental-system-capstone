export const STAFF_ALLOWED_ADMIN_PATHS = [
  "/admin/orders",
  "/admin/inventory",
  "/admin/payments",
  "/admin/profile",
] as const;

export function canAccessAdminPath(role: string | undefined, pathname: string) {
  if (role === "admin") {
    return true;
  }

  if (role !== "staff") {
    return false;
  }

  return STAFF_ALLOWED_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
