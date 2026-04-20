// ─── Requests ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ConfirmationTokenRequest {
  confirmationToken: string;
  newPassword?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ─── Responses ─────────────────────────────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  mfaRequired: boolean;
  challengeToken: string;
  mustChangePassword: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  qrUri: string;
  alreadyEnabled: boolean;
}

export interface VoidResponse {
  success: boolean;
  message: string;
}

// ─── Session ───────────────────────────────────────────────────────────────

export interface UserSession {
  email: string;
  roles: string[];
  permissions: string[];
  expiresAt: string;
  mustChangePassword: boolean;
}

export interface MeResponse {
  email: string;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
}
