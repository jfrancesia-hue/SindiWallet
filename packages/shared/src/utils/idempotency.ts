/**
 * Genera una clave de idempotencia única (UUID v4)
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Valida que una string sea un UUID v4 válido
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
