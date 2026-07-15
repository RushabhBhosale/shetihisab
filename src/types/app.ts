export type AppLanguage = 'mr' | 'en';

export type TextSizePreference = 'normal' | 'large' | 'extraLarge';

export type AreaUnit = 'guntha' | 'acre' | 'hectare';

export type CropStatus = 'active' | 'completed';

export interface AppProfile {
  id: number;
  name: string;
  village: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: number;
  language: AppLanguage;
  textSize: TextSizePreference;
  defaultAreaUnit: AreaUnit;
  setupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  name: string;
  village?: string | null;
}

export interface Farm {
  id: number;
  name: string;
  village: string | null;
  totalArea: number | null;
  areaUnit: AreaUnit;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FarmInput {
  name: string;
  village?: string | null;
  totalArea?: number | null;
  areaUnit: AreaUnit;
  notes?: string | null;
}

export interface Crop {
  id: number;
  farmId: number | null;
  farmName: string | null;
  cropName: string;
  season: string | null;
  area: number | null;
  areaUnit: AreaUnit;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  status: CropStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CropInput {
  farmId?: number | null;
  cropName: string;
  season?: string | null;
  area?: number | null;
  areaUnit: AreaUnit;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  status?: CropStatus;
  notes?: string | null;
}
