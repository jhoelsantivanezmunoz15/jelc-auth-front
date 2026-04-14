// ─── Domain ────────────────────────────────────────────────────────────────

export interface RoleRef {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  blocked: boolean;
  active: boolean;
  createdAt: string;
  createdBy: string;
  roles: RoleRef[];
  mfaEnabled: boolean;
  providers: string[];
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  roleIds: string[];
}

// ─── Responses ─────────────────────────────────────────────────────────────

export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
