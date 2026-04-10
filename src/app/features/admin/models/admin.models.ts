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

export { ApiResponse };
