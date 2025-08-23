export interface Role {
  id: string;
  name: string;
  color: string;
  /** Indicates if the role is a built-in system role */
  isSystem?: boolean;
  /** Optional description displayed in the UI */
  description?: string;
  /** Permissions assigned to the role */
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastLogin?: Date | null;
  avatar?: string;
  password?: string;
  fullAccess?: boolean;
  clientIds?: number[];
}

export interface UserFilters {
  search?: string;
  status?: User['status'];
  roleId?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface RoleFilters {
  search?: string;
  /** Filter by system or custom roles. Undefined means all */
  isSystem?: boolean;
  sortBy?: 'name';
  sortOrder?: 'asc' | 'desc';
}
