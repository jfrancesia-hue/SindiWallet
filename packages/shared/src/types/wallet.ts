export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface Wallet {
  id: string;
  orgId: string;
  userId: string;
  cvu: string | null;
  alias: string | null;
  balance: number;
  currency: string;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  cvu: string | null;
  alias: string | null;
  status: WalletStatus;
}
