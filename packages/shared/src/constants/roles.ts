export const Role = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  AFFILIATE: 'AFFILIATE',
  MERCHANT: 'MERCHANT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPERADMIN: 4,
  ADMIN: 3,
  AFFILIATE: 2,
  MERCHANT: 1,
};

export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
