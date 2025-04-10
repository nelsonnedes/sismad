/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico para exibição como medida em centímetros
 * @param valor Valor numérico a ser formatado
 * @returns String formatada com a unidade cm
 */
export function formatarMedida(valor: number): string {
  if (isNaN(valor) || valor === null) return '0 cm';
  return `${valor} cm`;
} 