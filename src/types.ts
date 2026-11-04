export interface Platform {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'government' | 'employment' | 'business' | 'justice' | 'custom' | 'other' | 'chamber';
  color: string; // Tailwind color class or hex, e.g., 'emerald' or 'blue'
  order: number;
}

export interface Task {
  id: string;
  title: string;
  clientName: string;
  clientPhone?: string;
  platformId?: string;
  feeAmount?: number;
  status: 'pending' | 'processing' | 'completed' | 'canceled';
  createdAt: string;
  notes?: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'gray';
  updatedAt: string;
}

export interface SavedTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface ServiceFee {
  id: string;
  name: string;
  categoryId: string;
  baseFee: number;
  description: string;
  variablesLabel?: string;
  variableMultiplier?: number;
  fixedExtraFee?: number;
}

export interface FeeCategory {
  id: string;
  name: string;
  services: ServiceFee[];
}

export interface PetitionDraft {
  id: string;
  title: string;
  category: 'istirham' | 'diwan' | 'assistance' | 'passports' | 'grievance' | 'custom';
  categoryLabel: string;
  targetAuthority: string;
  description: string;
  content: string;
  isCustom?: boolean;
}
