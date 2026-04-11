import { ApiResponse } from '../../../core/models/role.models';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

export type ConfigType = 'STRING' | 'INTEGER' | 'BOOLEAN' | 'JSON';
export type ConfigCategory = 'AUTH' | 'SECURITY' | 'TIMEOUT' | 'POLICY' | 'GENERAL';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: ConfigType;
  category: ConfigCategory;
  description: string | null;
  editable: boolean;
  deletable: boolean;
}

export interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface CreateSystemConfigRequest {
  key: string;
  value: string;
  type: ConfigType;
  category: ConfigCategory;
  description?: string;
  editable: boolean;
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────

export type AuditAction =
  // Auth
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'TOKEN_THEFT_DETECTED'
  | 'USER_REGISTERED'
  | 'EMAIL_CONFIRMED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_CHANGED'
  // Users
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  // Roles
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  // Feature flags
  | 'FEATURE_FLAG_CREATED'
  | 'FEATURE_FLAG_TOGGLED'
  | 'FEATURE_FLAG_DELETED'
  // System config
  | 'SYSTEM_CONFIG_CREATED'
  | 'SYSTEM_CONFIG_UPDATED'
  | 'SYSTEM_CONFIG_DELETED'
  // MFA
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'MFA_CHALLENGE_VERIFIED'
  | 'MFA_CHALLENGE_FAILED';

export interface AuditLog {
  id: string;
  action: AuditAction;
  performedBy: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  detail: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  performedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
}

export type { ApiResponse };
