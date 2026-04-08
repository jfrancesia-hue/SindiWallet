/**
 * Validadores financieros para Argentina — BCRA / AFIP
 */

/**
 * Valida CUIT/CUIL argentino (formato: XX-XXXXXXXX-X)
 * Algoritmo módulo 11
 */
export function isValidCuit(cuit: string): boolean {
  const clean = cuit.replace(/-/g, '');
  if (!/^\d{11}$/.test(clean)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = clean.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i]! * multipliers[i]!;
  }

  const remainder = sum % 11;
  const verifier =
    remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return verifier === digits[10]!;
}

/**
 * Valida CBU argentino (22 dígitos)
 * Bloques: banco (3) + sucursal (4) + dígito verificador (1) + cuenta (13) + dígito verificador (1)
 */
export function isValidCbu(cbu: string): boolean {
  if (!/^\d{22}$/.test(cbu)) return false;

  // Verificar primer bloque (8 dígitos: banco + sucursal + dv1)
  const block1 = cbu.substring(0, 8);
  const multipliers1 = [7, 1, 3, 7, 1, 3, 7];
  let sum1 = 0;
  for (let i = 0; i < 7; i++) {
    sum1 += parseInt(block1.charAt(i)) * multipliers1[i]!;
  }
  const dv1 = (10 - (sum1 % 10)) % 10;
  if (dv1 !== parseInt(block1.charAt(7))) return false;

  // Verificar segundo bloque (14 dígitos: cuenta + dv2)
  const block2 = cbu.substring(8, 22);
  const multipliers2 = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3];
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(block2.charAt(i)) * multipliers2[i]!;
  }
  const dv2 = (10 - (sum2 % 10)) % 10;
  if (dv2 !== parseInt(block2.charAt(13))) return false;

  return true;
}

/**
 * Valida CVU argentino (22 dígitos, prefijo 000 para entidades virtuales)
 */
export function isValidCvu(cvu: string): boolean {
  if (!/^\d{22}$/.test(cvu)) return false;
  // CVU comienza con 000 (identifica entidad virtual ante BCRA)
  return cvu.startsWith('000');
}

/**
 * Valida alias CBU/CVU (formato: palabra.palabra.palabra)
 */
export function isValidAlias(alias: string): boolean {
  return /^[a-z0-9]+(\.[a-z0-9]+){2,}$/.test(alias) && alias.length <= 20;
}

/**
 * Formatea CUIT para display: XX-XXXXXXXX-X
 */
export function formatCuit(cuit: string): string {
  const clean = cuit.replace(/-/g, '');
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}

/**
 * Formatea monto en pesos argentinos
 */
export function formatArs(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}
