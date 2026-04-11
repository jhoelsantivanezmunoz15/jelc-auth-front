export interface AuditLogSummary {
  action: string;
  performedBy: string | null;
  detail: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  newUsersThisWeek: number;
  totalRoles: number;
  totalPermissions: number;
  enabledFeatureFlags: number;
  totalFeatureFlags: number;
  activeSessions: number;
  successfulLoginsToday: number;
  failedLoginsToday: number;
  recentActivity: AuditLogSummary[];
}
