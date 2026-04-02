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
}
