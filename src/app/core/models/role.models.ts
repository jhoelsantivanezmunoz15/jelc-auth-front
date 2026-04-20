// ─── Domain ────────────────────────────────────────────────────────────────

export type PermissionType = 'SECURITY' | 'BUSINESS';

export interface Permission {
  id: string;
  code: string;
  name: string;
  permissionType: PermissionType;
}

export type RoleType = 'SECURITY' | 'BUSINESS';

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  roleType: RoleType;
  permissions: Permission[];
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  description: string;
  roleType: RoleType;
  permissions: string[];
}

export type UpdateRoleRequest = CreateRoleRequest;

// ─── Responses ─────────────────────────────────────────────────────────────

export type ApiStatus = 'SUCCESS' | 'ERROR' | 'WARNING';

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T;
}

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
