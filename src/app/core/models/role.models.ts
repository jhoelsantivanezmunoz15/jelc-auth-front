// ─── Domain ────────────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  code: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: string;
}

// ─── Responses ─────────────────────────────────────────────────────────────

export type ApiStatus = 'SUCCESS' | 'ERROR' | 'WARNING';

export interface ApiResponse<T> {
  status: ApiStatus;
  message: string;
  data: T;
}
