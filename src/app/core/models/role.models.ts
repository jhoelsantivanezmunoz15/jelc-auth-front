// ─── Domain ────────────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  code: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  permissions: Permission[];
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  description: string;
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
