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

export interface ServiceFeeItem {
  id: string;
  name: string;
  category: 'commercial' | 'sponsorship' | 'iqama' | 'work_permit' | 'single' | 'custom';
  entity: string;
  governmentFee: number;
  defaultOfficeFee: number;
  calculationType: 'fixed' | 'annual' | 'per_worker' | 'tiered' | 'monthly';
  verificationStatus: 'verified' | 'needs_review' | 'unverified';
  lastVerifiedAt: string;
  officialSource: string;
  officialSourceUrl?: string;
  isActive: boolean;
  description?: string;
  priceChangeHistory?: Array<{ date: string; previousGovFee: number; newGovFee: number; changedBy: string }>;
}

export interface QuoteItem {
  id: string;
  name: string;
  entity: string;
  quantity: number;
  unitGovernmentFee: number;
  totalGovernmentFee: number;
  unitOfficeFee: number;
  totalOfficeFee: number;
  discount: number;
  notes?: string;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientPhone: string;
  serviceType: 'commercial' | 'sponsorship' | 'iqama' | 'work_permit' | 'single' | 'custom';
  serviceTitle: string;
  items: QuoteItem[];
  totalGovernmentFees: number;
  totalOfficeFees: number;
  totalDiscount: number;
  vatRate: number; // 0 or 15
  vatAmount: number;
  grandTotal: number;
  status: 'draft' | 'pending_payment' | 'approved' | 'completed' | 'canceled';
  createdAt: string;
  validUntil: string;
  responsibleEmployee: string;
  notes?: string;
}

