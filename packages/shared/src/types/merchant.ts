export interface Merchant {
  id: string;
  orgId: string;
  userId: string;
  businessName: string;
  cuit: string;
  category: string;
  address: string | null;
  phone: string | null;
  discountPercent: number;
  isActive: boolean;
  qrCode: string | null;
  settlementFrequency: string;
  createdAt: string;
}

export interface CreateMerchantPayload {
  userId: string;
  businessName: string;
  cuit: string;
  category: string;
  address?: string;
  phone?: string;
  discountPercent?: number;
  settlementFrequency?: string;
}
