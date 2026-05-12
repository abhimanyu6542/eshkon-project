export type Role = "viewer" | "editor" | "publisher";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const ROLE_PERMISSIONS = {
  viewer: ["preview"],
  editor: ["preview", "edit"],
  publisher: ["preview", "edit", "publish"],
} as const satisfies Record<Role, string[]>;

export type Permission = (typeof ROLE_PERMISSIONS)[Role][number];

export function hasPermission(role: Role, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[role] as readonly string[]).includes(permission);
}
