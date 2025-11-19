/**
 * Permission constants for the Club Management System
 * These should match the backend permission definitions
 */

export enum Permission {
  // Club permissions
  CREATE_CLUB = 'CREATE_CLUB',
  VIEW_CLUB = 'VIEW_CLUB',
  UPDATE_CLUB = 'UPDATE_CLUB',
  DELETE_CLUB = 'DELETE_CLUB',
  APPROVE_CLUB = 'APPROVE_CLUB',
  
  // Member permissions
  MANAGE_MEMBERS = 'MANAGE_MEMBERS',
  VIEW_MEMBERS = 'VIEW_MEMBERS',
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  UPDATE_MEMBER_ROLE = 'UPDATE_MEMBER_ROLE',
  
  // Event permissions
  CREATE_EVENT = 'CREATE_EVENT',
  VIEW_EVENT = 'VIEW_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  MANAGE_ATTENDANCE = 'MANAGE_ATTENDANCE',
  
  // Budget permissions
  VIEW_BUDGET = 'VIEW_BUDGET',
  MANAGE_BUDGET = 'MANAGE_BUDGET',
  APPROVE_BUDGET = 'APPROVE_BUDGET',
  CREATE_EXPENDITURE = 'CREATE_EXPENDITURE',
  APPROVE_EXPENDITURE = 'APPROVE_EXPENDITURE',
  
  // User permissions
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  
  // System permissions
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
}

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  Admin: [
    // All permissions
    Permission.CREATE_CLUB,
    Permission.VIEW_CLUB,
    Permission.UPDATE_CLUB,
    Permission.DELETE_CLUB,
    Permission.APPROVE_CLUB,
    Permission.MANAGE_MEMBERS,
    Permission.VIEW_MEMBERS,
    Permission.ADD_MEMBER,
    Permission.REMOVE_MEMBER,
    Permission.UPDATE_MEMBER_ROLE,
    Permission.CREATE_EVENT,
    Permission.VIEW_EVENT,
    Permission.UPDATE_EVENT,
    Permission.DELETE_EVENT,
    Permission.MANAGE_ATTENDANCE,
    Permission.VIEW_BUDGET,
    Permission.MANAGE_BUDGET,
    Permission.APPROVE_BUDGET,
    Permission.CREATE_EXPENDITURE,
    Permission.APPROVE_EXPENDITURE,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.ASSIGN_ROLES,
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_SYSTEM,
  ],
  Faculty: [
    Permission.VIEW_CLUB,
    Permission.APPROVE_CLUB,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_MEMBERS,
    Permission.VIEW_EVENT,
    Permission.VIEW_BUDGET,
    Permission.APPROVE_BUDGET,
    Permission.APPROVE_EXPENDITURE,
    Permission.VIEW_USERS,
    Permission.VIEW_DASHBOARD,
  ],
  Student: [
    Permission.VIEW_CLUB,
    Permission.CREATE_CLUB,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_EVENT,
    Permission.CREATE_EVENT,
    Permission.VIEW_BUDGET,
    Permission.CREATE_EXPENDITURE,
    Permission.VIEW_DASHBOARD,
  ],
  'Club Leader': [
    Permission.VIEW_CLUB,
    Permission.UPDATE_CLUB,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_MEMBERS,
    Permission.ADD_MEMBER,
    Permission.REMOVE_MEMBER,
    Permission.CREATE_EVENT,
    Permission.VIEW_EVENT,
    Permission.UPDATE_EVENT,
    Permission.DELETE_EVENT,
    Permission.MANAGE_ATTENDANCE,
    Permission.VIEW_BUDGET,
    Permission.CREATE_EXPENDITURE,
    Permission.VIEW_DASHBOARD,
  ],
  'Club Member': [
    Permission.VIEW_CLUB,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_EVENT,
    Permission.VIEW_BUDGET,
    Permission.VIEW_DASHBOARD,
  ],
};

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
}

