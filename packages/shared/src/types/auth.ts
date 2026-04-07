import type { Role } from '../constants/roles';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
  orgId: string;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    orgId: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone?: string;
  orgId: string;
}
