export interface Organization {
  id: string;
  name: string;
  slug: string;
  cuit: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  maxLoanMultiplier: number;
  loanInterestRate: number;
  loanMaxTermMonths: number;
  scoringMinScore: number;
  baasProvider: 'bind' | 'pomelo';
  whitelabelEnabled: boolean;
  [key: string]: unknown;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  cuit: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface UpdateBrandingPayload {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}
