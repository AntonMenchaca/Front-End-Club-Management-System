import { Permission, getPermissionsForRole, roleHasPermission } from './permissions';

export type SystemRole = 'Admin' | 'Faculty' | 'Student';
export type ClubRole = 'Club Leader' | 'Club Member';

/**
 * Role hierarchy - higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<string, string[]> = {
  Admin: ['Faculty', 'Student', 'Club Leader', 'Club Member'],
  Faculty: ['Student', 'Club Leader', 'Club Member'],
  Student: ['Club Member'],
  'Club Leader': ['Club Member'],
  'Club Member': [],
};

/**
 * Get all permissions for a user based on their roles
 */
export function getUserPermissions(
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): Permission[] {
  const permissions = new Set<Permission>();

  // Add system role permissions
  if (systemRole) {
    const systemPermissions = getPermissionsForRole(systemRole);
    systemPermissions.forEach((p) => permissions.add(p));
  }

  // Add club role permissions
  clubRoles.forEach((role) => {
    const clubPermissions = getPermissionsForRole(role);
    clubPermissions.forEach((p) => permissions.add(p));
  });

  return Array.from(permissions);
}

/**
 * Check if user has a specific permission
 */
export function userHasPermission(
  permission: Permission,
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): boolean {
  const userPermissions = getUserPermissions(systemRole, clubRoles);
  return userPermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function userHasAnyPermission(
  permissions: Permission[],
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): boolean {
  return permissions.some((permission) =>
    userHasPermission(permission, systemRole, clubRoles)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function userHasAllPermissions(
  permissions: Permission[],
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): boolean {
  return permissions.every((permission) =>
    userHasPermission(permission, systemRole, clubRoles)
  );
}

/**
 * Check if user has a specific role
 */
export function userHasRole(
  role: SystemRole | ClubRole,
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): boolean {
  if (systemRole === role) return true;
  if (clubRoles.includes(role as ClubRole)) return true;
  return false;
}

/**
 * Check if user has any of the specified roles
 */
export function userHasAnyRole(
  roles: (SystemRole | ClubRole)[],
  systemRole: SystemRole | null,
  clubRoles: ClubRole[] = []
): boolean {
  return roles.some((role) => userHasRole(role, systemRole, clubRoles));
}

