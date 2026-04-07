import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  cuit: z.string().regex(/^\d{2}-?\d{7,8}-?\d$/, 'CUIT inválido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  website: z.string().url().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  website: z.string().url().optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateBrandingSchema = z.object({
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
