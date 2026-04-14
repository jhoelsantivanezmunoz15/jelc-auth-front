export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ActiveSession {
  id: string;
  expiresAt: string;
  metadata: Record<string, unknown>;
}

export interface MfaSetupData {
  secret: string;
  qrUri: string;
  alreadyEnabled: boolean;
}

export interface EnableMfaRequest {
  code: string;
}

export interface DisableMfaRequest {
  currentPassword: string;
}

export interface LinkProviderResponse {
  redirectUrl: string;
}

export interface RequestChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface SetPasswordRequest {
  newPassword: string;
}

export interface ForceChangePasswordRequest {
  newPassword: string;
}
