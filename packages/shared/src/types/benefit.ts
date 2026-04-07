export type BenefitRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CANCELLED';

export interface Benefit {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  category: string;
  amount: number | null;
  maxAmount: number | null;
  requiresApproval: boolean;
  isActive: boolean;
  requirements: Record<string, unknown> | null;
  createdAt: string;
}

export interface BenefitRequest {
  id: string;
  orgId: string;
  benefitId: string;
  userId: string;
  status: BenefitRequestStatus;
  amount: number;
  notes: string | null;
  attachments: string[] | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
}
