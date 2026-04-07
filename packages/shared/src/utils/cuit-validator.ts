/**
 * Valida un CUIT/CUIL argentino.
 * Formato: XX-XXXXXXXX-X (con o sin guiones)
 * Algoritmo: módulo 11 con multiplicadores [5,4,3,2,7,6,5,4,3,2]
 */
export function isValidCuit(cuit: string): boolean {
  const clean = cuit.replace(/-/g, '');
  if (!/^\d{11}$/.test(clean)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = clean.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += (digits[i] ?? 0) * (multipliers[i] ?? 0);
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return checkDigit === digits[10];
}

/**
 * Formatea un CUIT con guiones: XX-XXXXXXXX-X
 */
export function formatCuit(cuit: string): string {
  const clean = cuit.replace(/-/g, '');
  if (clean.length !== 11) return cuit;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}
