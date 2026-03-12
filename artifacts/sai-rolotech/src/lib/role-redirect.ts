export function getRoleRedirectPath(role: string): string {
  switch (role) {
    case "admin":
    case "sub_admin":
      return "/admin";
    case "supplier":
      return "/supplier/me";
    case "vendor":
      return "/vendor-portal";
    case "engineer":
    case "project_manager":
      return "/engineer";
    case "assembly_head":
      return "/assembly";
    case "buyer":
    default:
      return "/";
  }
}
