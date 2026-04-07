import { z } from 'zod';

export const createWalletSchema = z.object({
  userId: z.string().cuid(),
  currency: z.string().default('ARS'),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
