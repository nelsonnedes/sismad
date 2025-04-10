/**
 * Utilitários para manipulação e exibição de dados de madeira
 */

/**
 * Formata um valor em metros cúbicos para exibição
 * @param volume Valor em metros cúbicos
 * @param decimals Número de casas decimais (padrão: 3)
 */
export function formatarVolume(volume: number, decimals: number = 3): string {
  if (isNaN(volume) || volume === null) return '0,000';
  return volume.toFixed(decimals).replace('.', ',');
}

/**
 * Formata um valor monetário para exibição em Reais
 * @param valor Valor a ser formatado
 */
export function formatarMoeda(valor: number): string {
  if (isNaN(valor) || valor === null) return 'R$ 0,00';
  return `R$ ${valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * Calcula o volume em m³ de uma peça de madeira
 * @param largura Largura em centímetros
 * @param altura Altura/espessura em centímetros
 * @param comprimento Comprimento em metros
 * @returns Volume em m³
 */
export function calcularVolumePeca(largura: number, altura: number, comprimento: number): number {
  // Convertendo as dimensões para metros
  const larguraM = largura / 100;
  const alturaM = altura / 100;
  
  // Considerando que o comprimento já está em metros
  return larguraM * alturaM * comprimento;
}

/**
 * Calcula o volume em m³ de um pacote de madeira
 * @param largura Largura em centímetros
 * @param altura Altura/espessura em centímetros
 * @param comprimento Comprimento em metros
 * @param pecasPorPacote Quantidade de peças por pacote
 * @returns Volume em m³
 */
export function calcularVolumePacote(largura: number, altura: number, comprimento: number, pecasPorPacote: number): number {
  // Calculando o volume de uma peça
  const volumePeca = calcularVolumePeca(largura, altura, comprimento);
  
  // Multiplicando pelo número de peças
  return volumePeca * pecasPorPacote;
}

/**
 * Calcula o volume em m³ de uma tora de madeira
 * @param diametro Diâmetro da tora em centímetros
 * @param comprimento Comprimento em metros
 * @returns Volume em m³
 */
export function calcularVolumeTora(diametro: number, comprimento: number): number {
  // Convertendo o diâmetro para metros e dividindo por 2 para obter o raio
  const raioM = (diametro / 100) / 2;
  
  // Usando a fórmula do volume de um cilindro: π * r² * h
  return Math.PI * raioM * raioM * comprimento;
}

/**
 * Converte uma medida em pés para metros cúbicos
 * @param pes Valor em pés
 * @returns Valor em metros cúbicos
 */
export function pesParaMetrosCubicos(pes: number): number {
  // 1 pé de madeira serrada equivale a aproximadamente 0,002359737 m³
  return pes * 0.002359737;
} 