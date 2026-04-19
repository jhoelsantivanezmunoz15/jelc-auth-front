import { PageResult } from '../../../core/models/role.models';

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface BusinessContext {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface BusinessProfileForm {
  name: string;
  description: string;
}

export interface BusinessContextForm {
  name: string;
  description: string;
}

// Re-export for convenience
export type { PageResult };
