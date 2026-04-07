import { z } from 'zod';

const roleEnum = z.enum(['SUPERADMIN', 'ADMIN', 'AFFILIATE', 'MERCHANT']);

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI debe tener 7 u 8 dígitos'),
  phone: z.string().optional(),
  cuit: z
    .string()
    .regex(/^\d{2}-?\d{7,8}-?\d$/, 'CUIT inválido')
    .optional(),
  role: roleEnum.optional().default('AFFILIATE'),
  employerName: z.string().optional(),
  employerCuit: z.string().optional(),
  salary: z.number().positive().optional(),
  memberSince: z.string().datetime().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(10).optional(),
  avatarUrl: z.string().url().optional(),
});

export const kycUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED']),
  kycData: z.record(z.unknown()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type KycUpdateInput = z.infer<typeof kycUpdateSchema>;
