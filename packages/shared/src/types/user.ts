import type { Role } from '../constants/roles';

export type KycStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  orgId: string;
  supabaseUserId: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  dni: string;
  cuit: string | null;
  role: Role;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  employerName: string | null;
  employerCuit: string | null;
  salary: number | null;
  memberSince: string | null;
  kycStatus: KycStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  cuit?: string;
  role?: Role;
  employerName?: string;
  employerCuit?: string;
  salary?: number;
  memberSince?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  avatarUrl?: string;
}
