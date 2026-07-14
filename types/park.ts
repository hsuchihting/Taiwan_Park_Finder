export type ParkFeatureType =
  | 'toilet'
  | 'playground'
  | 'accessible'
  | 'pet_friendly'
  | 'mrt_nearby'
  | 'ubike'
  | 'parking'
  | 'shade'
  | 'basketball'
  | 'picnic'
  | 'trail';

export type FeatureConfidence =
  | 'official'
  | 'user_reported'
  | 'inferred';

export interface ParkFeature {
  type: ParkFeatureType;
  label: string;
  confidence: FeatureConfidence;
}

export interface Park {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  features: ParkFeature[];
  description?: string;
  sourceName?: string;
  sourceUrl?: string;
  lastVerifiedAt?: string;
}

export interface ParkSearchQuery {
  rawText: string;
  location?: string;
  city?: string;
  district?: string;
  intent?: 'parent_child' | 'pet' | 'accessibility' | 'exercise' | 'picnic' | 'general';
  mustHave: ParkFeatureType[];
  niceToHave: ParkFeatureType[];
}

export interface ParkRecommendation {
  park: Park;
  score: number;
  matchedFeatures: ParkFeatureType[];
  missingFeatures: ParkFeatureType[];
  reason: string;
  confidenceLabel: string;
}

export interface ParkSearchResponse {
  parks: Park[];
  source: 'twinkle-hub';
  message?: string;
  datasets?: Array<{
    id: string;
    title: string;
    sourceUrl?: string;
    license?: string;
  }>;
}
