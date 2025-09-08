// Permission definitions
export const PERMISSIONS = {
  // User permissions
  USER: {
    VIEW_OWN_APPLICATIONS: 'view_own_applications',
    CREATE_APPLICATION: 'create_application',
    VIEW_OWN_PROFILE: 'view_own_profile',
    UPDATE_OWN_PROFILE: 'update_own_profile',
  },
  
  // Staff permissions
  STAFF: {
    VIEW_ASSIGNED_APPLICATIONS: 'view_assigned_applications',
    UPDATE_APPLICATION_STATUS: 'update_application_status',
    ASSIGN_APPLICATION: 'assign_application',
    VIEW_STAFF_DASHBOARD: 'view_staff_dashboard',
  },
  
  // Officer permissions
  OFFICER: {
    VIEW_ALL_APPLICATIONS: 'view_all_applications',
    UPDATE_ANY_APPLICATION_STATUS: 'update_any_application_status',
    ASSIGN_ANY_APPLICATION: 'assign_any_application',
    CREATE_SERVICE: 'create_service',
    UPDATE_SERVICE: 'update_service',
    DELETE_SERVICE: 'delete_service',
    VIEW_OFFICER_DASHBOARD: 'view_officer_dashboard',
    MANAGE_USERS: 'manage_users',
    VIEW_ANALYTICS: 'view_analytics',
  }
};

// Role hierarchy
export const ROLES = {
  USER: 'user',
  STAFF: 'staff',
  OFFICER: 'officer'
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.USER]: [
    PERMISSIONS.USER.VIEW_OWN_APPLICATIONS,
    PERMISSIONS.USER.CREATE_APPLICATION,
    PERMISSIONS.USER.VIEW_OWN_PROFILE,
    PERMISSIONS.USER.UPDATE_OWN_PROFILE,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.USER.VIEW_OWN_APPLICATIONS,
    PERMISSIONS.USER.CREATE_APPLICATION,
    PERMISSIONS.USER.VIEW_OWN_PROFILE,
    PERMISSIONS.USER.UPDATE_OWN_PROFILE,
    PERMISSIONS.STAFF.VIEW_ASSIGNED_APPLICATIONS,
    PERMISSIONS.STAFF.UPDATE_APPLICATION_STATUS,
    PERMISSIONS.STAFF.ASSIGN_APPLICATION,
    PERMISSIONS.STAFF.VIEW_STAFF_DASHBOARD,
  ],
  [ROLES.OFFICER]: [
    PERMISSIONS.USER.VIEW_OWN_APPLICATIONS,
    PERMISSIONS.USER.CREATE_APPLICATION,
    PERMISSIONS.USER.VIEW_OWN_PROFILE,
    PERMISSIONS.USER.UPDATE_OWN_PROFILE,
    PERMISSIONS.STAFF.VIEW_ASSIGNED_APPLICATIONS,
    PERMISSIONS.STAFF.UPDATE_APPLICATION_STATUS,
    PERMISSIONS.STAFF.ASSIGN_APPLICATION,
    PERMISSIONS.STAFF.VIEW_STAFF_DASHBOARD,
    PERMISSIONS.OFFICER.VIEW_ALL_APPLICATIONS,
    PERMISSIONS.OFFICER.UPDATE_ANY_APPLICATION_STATUS,
    PERMISSIONS.OFFICER.ASSIGN_ANY_APPLICATION,
    PERMISSIONS.OFFICER.CREATE_SERVICE,
    PERMISSIONS.OFFICER.UPDATE_SERVICE,
    PERMISSIONS.OFFICER.DELETE_SERVICE,
    PERMISSIONS.OFFICER.VIEW_OFFICER_DASHBOARD,
    PERMISSIONS.OFFICER.MANAGE_USERS,
    PERMISSIONS.OFFICER.VIEW_ANALYTICS,
  ]
};

/**
 * Check if a user has a specific permission
 * @param userRole - The role of the user
 * @param permission - The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has a specific role or higher
 * @param userRole - The role of the user
 * @param requiredRole - The required role
 * @returns Boolean indicating if the user has the required role or higher
 */
export function hasRoleOrHigher(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = [ROLES.USER, ROLES.STAFF, ROLES.OFFICER];
  
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  // If either role is not in hierarchy, deny access
  if (userRoleIndex === -1 || requiredRoleIndex === -1) {
    return false;
  }
  
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if a user can access a specific application
 * @param userRole - The role of the user
 * @param userId - The ID of the user
 * @param application - The application object
 * @returns Boolean indicating if the user can access the application
 */
export function canAccessApplication(userRole: string, userId: string, application: any): boolean {
  // Officers can access all applications
  if (userRole === ROLES.OFFICER) {
    return true;
  }
  
  // Staff can access applications assigned to them
  if (userRole === ROLES.STAFF && application.assignedTo && application.assignedTo._id === userId) {
    return true;
  }
  
  // Users can access their own applications
  if (userRole === ROLES.USER && application.applicant && application.applicant._id === userId) {
    return true;
  }
  
  return false;
}

/**
 * Check if a user can modify a specific application
 * @param userRole - The role of the user
 * @param userId - The ID of the user
 * @param application - The application object
 * @returns Boolean indicating if the user can modify the application
 */
export function canModifyApplication(userRole: string, userId: string, application: any): boolean {
  // Officers can modify all applications
  if (userRole === ROLES.OFFICER) {
    return true;
  }
  
  // Staff can modify applications assigned to them
  if (userRole === ROLES.STAFF && application.assignedTo && application.assignedTo._id === userId) {
    return true;
  }
  
  // Users cannot modify applications after submission
  if (userRole === ROLES.USER) {
    return false;
  }
  
  return false;
}