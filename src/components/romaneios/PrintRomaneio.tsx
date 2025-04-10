import React from 'react';
import styled from 'styled-components';
import { formatarVolume, formatarMoeda } from '../../utils/madeira';
import { PrintOptions, printContent, generateHeader, getCompanyLogo, getCompanyData } from '../../utils/printing';
import { ThemeType } from '../../styles/theme';

// Interfaces para os diferentes tipos de itens de romaneio
export interface BaseRomaneioItem {
  id: number;
  quantidade: number;
  volume: number;
  valorUnitario: number;
  valorTotal: number;
  especieId?: string;
  especieNome?: string;
}

export interface RomaneioTLItem extends BaseRomaneioItem {
  largura: number;
  comprimento: number;
  bitola: number; // Espessura
}

export interface RomaneioPCItem extends BaseRomaneioItem {
  largura: number;
  comprimento: number;
  espessura: number;
  pecasPorPacote: number;
}

export interface RomaneioPESItem extends BaseRomaneioItem {
  largura: number;
  espessura: number;
  comprimento: number;
}

// Interface para o Romaneio base
export interface BaseRomaneio {
  id: string;
  tipo: string;
  cliente: string;
  clienteNome: string;
  data: Date;
  numero: string;
  volumeTotal: number;
  preco?: number;
  valorTotal?: number;
  dataCriacao: Date;
  especie?: string;
  especieNome?: string;
}

export interface RomaneioTL extends BaseRomaneio {
  itens: RomaneioTLItem[];
}

export interface RomaneioPC extends BaseRomaneio {
  itens: RomaneioPCItem[];
}

export interface RomaneioPES extends BaseRomaneio {
  itens: RomaneioPESItem[];
}

export type Romaneio = RomaneioTL | RomaneioPC | RomaneioPES;

// Interface para o tema do styled-components
interface StyledProps {
  theme: ThemeType;
}

// Interface para as props do componente
interface PrintRomaneioProps {
  romaneio: Romaneio;
  printOption: PrintOptions;
  onClose?: () => void;
}

// Component para o botão de impressão
export const PrintButton = styled.button<StyledProps>`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }

  i {
    font-size: 14px;
  }
`;

// Menu de opções de impressão
export const PrintOptionsMenu = styled.div`
  position: fixed;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  width: 220px;
  z-index: 9999;
  max-height: 80vh;
  overflow-y: auto;
`;

export const PrintOptionItem = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// Componente para exibir o menu de opções de impressão
interface PrintMenuProps {
  position: { top: number; left: number };
  onSelect: (option: PrintOptions) => void;
  onClose: () => void;
}

export const PrintMenu: React.FC<PrintMenuProps> = ({ position, onSelect, onClose }) => {
  // Calcular posição ajustada para garantir visibilidade
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);
  
  React.useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let adjustedTop = position.top;
      let adjustedLeft = position.left;
      
      // Verificar se o menu está saindo da parte inferior da viewport
      if (position.top + menuRect.height > viewportHeight) {
        adjustedTop = Math.max(5, viewportHeight - menuRect.height - 5);
      }
      
      // Verificar se o menu está saindo da lateral direita da viewport
      if (position.left + menuRect.width > viewportWidth) {
        adjustedLeft = Math.max(5, viewportWidth - menuRect.width - 5);
      }
      
      setAdjustedPosition({ top: adjustedTop, left: adjustedLeft });
    }
  }, [position]);
  
  // Fechar o menu quando clicar fora dele
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.print-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <PrintOptionsMenu 
      ref={menuRef}
      className="print-menu" 
      style={{ top: adjustedPosition.top, left: adjustedPosition.left }}
    >
      <PrintOptionItem onClick={() => onSelect(PrintOptions.COMPLETE)}>
        <i className="fas fa-print"></i> Completo
      </PrintOptionItem>
      <PrintOptionItem onClick={() => onSelect(PrintOptions.NO_UNIT_PRICE)}>
        <i className="fas fa-dollar-sign"></i> Sem Preço Unitário
      </PrintOptionItem>
      <PrintOptionItem onClick={() => onSelect(PrintOptions.NO_PRICE)}>
        <i className="fas fa-ban"></i> Sem Preços
      </PrintOptionItem>
    </PrintOptionsMenu>
  );
};

// Adicionar função para identificar o produto
const identificarProduto = (espessura: number, largura: number): string => {
  if (espessura > 12 && largura >= 12) {
    return 'Bloco, Quadrado ou Filé';
  } else if (espessura > 7 && largura >= 20) {
    return 'Pranchão';
  } else if (espessura >= 4 && espessura <= 7 && largura >= 20) {
    return 'Prancha';
  } else if (espessura >= 4 && largura >= 11 && largura <= 20) {
    return 'Viga';
  } else if (espessura >= 4 && espessura <= 11 && largura >= 8 && largura <= 10.9) {
    return 'Vigota';
  } else if (espessura >= 4 && espessura <= 8 && largura >= 4 && largura <= 7.9) {
    return 'Caibro';
  } else if (espessura >= 1 && espessura <= 3.9 && largura > 10) {
    return 'Tábua';
  } else if (espessura >= 2 && espessura <= 3.9 && largura >= 2 && largura <= 10) {
    return 'Sarrafos';
  } else if (espessura < 2 && largura >= 10) {
    return 'Ripa';
  }
  return 'Outros';
};

// Função para gerar o resumo por espécie e bitola
const renderResumo = (itens: any[]) => {
  // Agrupar por espécie
  const resumoPorEspecie = itens.reduce((acc, item) => {
    const especieNome = item.especieNome || 'Sem Espécie';
    const dimensaoKey = `${item.espessura || item.bitola}x${item.largura}`;
    
    if (!acc[especieNome]) {
      acc[especieNome] = {
        dimensoes: {},
        totalVolume: 0,
        totalUnidades: 0
      };
    }
    
    if (!acc[especieNome].dimensoes[dimensaoKey]) {
      acc[especieNome].dimensoes[dimensaoKey] = {
        volume: 0,
        unidades: 0
      };
    }
    
    acc[especieNome].dimensoes[dimensaoKey].volume += item.volume;
    acc[especieNome].dimensoes[dimensaoKey].unidades += item.quantidade;
    acc[especieNome].totalVolume += item.volume;
    acc[especieNome].totalUnidades += item.quantidade;
    
    return acc;
  }, {});

  // Agrupar por tipo de produto
  const resumoPorBitola = itens.reduce((acc, item) => {
    const tipoProduto = identificarProduto(
      item.espessura || item.bitola, 
      item.largura
    );
    
    if (!acc[tipoProduto]) {
      acc[tipoProduto] = {
        volume: 0,
        unidades: 0
      };
    }
    
    acc[tipoProduto].volume += item.volume;
    acc[tipoProduto].unidades += item.quantidade;
    
    return acc;
  }, {});

  return `
    <div class="resumo-section" style="page-break-before: always;">
      <h3 style="color: #333; margin-bottom: 15px;">Resumo por Espécie, Espessura e Largura</h3>
      ${Object.entries(resumoPorEspecie).map(([especieNome, dados]: [string, any]) => `
        <div class="resumo-especie" style="margin-bottom: 15px;">
          <h4 style="color: #444; margin-bottom: 10px;">${especieNome}</h4>
          ${Object.entries(dados.dimensoes).map(([dimensao, info]: [string, any]) => `
            <div class="dimensao-item" style="margin-left: 20px; margin-bottom: 5px;">
              ${dimensao} - TOTAL: ${formatarVolume(info.volume)} (${info.unidades} unidades)
            </div>
          `).join('')}
          <div class="subtotal-especie" style="margin-left: 20px; margin-bottom: 10px; color: #0056b3;">
            Subtotal ${especieNome}: ${formatarVolume(dados.totalVolume)} (${dados.totalUnidades} unidades)
          </div>
        </div>
      `).join('')}

      <h3 style="color: #333; margin: 20px 0 15px;">Resumo por Tipo de Bitola</h3>
      ${Object.entries(resumoPorBitola).map(([tipo, dados]: [string, any]) => `
        <div class="resumo-bitola" style="margin-bottom: 10px;">
          <div class="bitola-tipo" style="margin-left: 20px;">
            ${tipo} - TOTAL: ${formatarVolume(dados.volume)} (${dados.unidades} unidades)
          </div>
        </div>
      `).join('')}
    </div>
    <style>
      @media print {
        .resumo-section {
          page-break-before: always;
          padding-top: 20px;
        }
        .resumo-especie, .resumo-bitola {
          page-break-inside: avoid;
        }
      }
    </style>
  `;
};

// Componente principal para impressão de romaneio
const PrintRomaneio: React.FC<PrintRomaneioProps> = ({ romaneio, printOption, onClose }) => {
  // Função para renderizar cabeçalho do romaneio
  const renderRomaneioHeader = () => {
    const formattedDate = new Date(romaneio.data).toLocaleDateString('pt-BR');
    
    return `
      <div class="romaneio-header">
        <div class="header-row">
          <span><strong>Número:</strong> ${romaneio.numero}</span>
          <span><strong>Data:</strong> ${formattedDate}</span>
          <span><strong>Cliente:</strong> ${romaneio.clienteNome}</span>
        </div>
      </div>
      <style>
        .romaneio-header {
          margin-bottom: 20px;
        }
        .header-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .header-row span {
          flex: 1;
          min-width: 23%;
          margin-right: 10px;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-row span:last-child {
          margin-right: 0;
        }
        @media print {
          .header-row {
            page-break-inside: avoid;
          }
        }
      </style>
    `;
  };

  // Função para renderizar tabela de itens de romaneio TL
  const renderRomaneioTLItems = (items: RomaneioTLItem[]) => {
    const showUnitPrice = printOption !== PrintOptions.NO_PRICE;
    const showTotalPrice = printOption !== PrintOptions.NO_PRICE;
    const showUnitPriceColumn = printOption === PrintOptions.COMPLETE;
    
    return `
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Espécie</th>
            <th>Espessura (cm)</th>
            <th>Largura (cm)</th>
            <th>Comprimento (cm)</th>
            <th>Quantidade</th>
            <th>Volume (m³)</th>
            ${showUnitPriceColumn ? '<th>Preço/m³</th>' : ''}
            ${showTotalPrice ? '<th>Valor Total</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.especieNome || '-'}</td>
              <td>${item.bitola}</td>
              <td>${item.largura}</td>
              <td>${item.comprimento}</td>
              <td>${item.quantidade}</td>
              <td>${formatarVolume(item.volume)}</td>
              ${showUnitPriceColumn ? `<td>${formatarMoeda(item.valorUnitario)}</td>` : ''}
              ${showTotalPrice ? `<td>${formatarMoeda(item.valorTotal)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px 4px;
          text-align: center;
        }
        th {
          background-color: #f2f2f2;
          font-size: 11px;
          font-weight: bold;
        }
        td {
          font-size: 12px;
        }
        td:nth-child(2) {
          text-align: left;
        }
      </style>
    `;
  };

  // Função para renderizar tabela de itens de romaneio PC
  const renderRomaneioPCItems = (items: RomaneioPCItem[]) => {
    const showUnitPrice = printOption !== PrintOptions.NO_PRICE;
    const showTotalPrice = printOption !== PrintOptions.NO_PRICE;
    const showUnitPriceColumn = printOption === PrintOptions.COMPLETE;
    
    return `
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Espécie</th>
            <th>Espessura (cm)</th>
            <th>Largura (cm)</th>
            <th>Comprimento (cm)</th>
            <th>Peças/Pacote</th>
            <th>Pacotes</th>
            <th>Volume (m³)</th>
            ${showUnitPriceColumn ? '<th>Preço/m³</th>' : ''}
            ${showTotalPrice ? '<th>Valor Total</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.especieNome || '-'}</td>
              <td>${item.espessura}</td>
              <td>${item.largura}</td>
              <td>${item.comprimento}</td>
              <td>${item.pecasPorPacote}</td>
              <td>${item.quantidade}</td>
              <td>${formatarVolume(item.volume)}</td>
              ${showUnitPriceColumn ? `<td>${formatarMoeda(item.valorUnitario)}</td>` : ''}
              ${showTotalPrice ? `<td>${formatarMoeda(item.valorTotal)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px 4px;
          text-align: center;
        }
        th {
          background-color: #f2f2f2;
          font-size: 11px;
          font-weight: bold;
        }
        td {
          font-size: 12px;
        }
        td:nth-child(2) {
          text-align: left;
        }
      </style>
    `;
  };

  // Função para renderizar tabela de itens de romaneio PES
  const renderRomaneioPESItems = (items: RomaneioPESItem[]) => {
    const showUnitPrice = printOption !== PrintOptions.NO_PRICE;
    const showTotalPrice = printOption !== PrintOptions.NO_PRICE;
    const showUnitPriceColumn = printOption === PrintOptions.COMPLETE;
    
    return `
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Espécie</th>
            <th>Espessura (cm)</th>
            <th>Largura (cm)</th>
            <th>Comprimento (cm)</th>
            <th>Quantidade</th>
            <th>Volume (m³)</th>
            ${showUnitPriceColumn ? '<th>Preço/m³</th>' : ''}
            ${showTotalPrice ? '<th>Valor Total</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.especieNome || '-'}</td>
              <td>${item.espessura}</td>
              <td>${item.largura}</td>
              <td>${item.comprimento}</td>
              <td>${item.quantidade}</td>
              <td>${formatarVolume(item.volume)}</td>
              ${showUnitPriceColumn ? `<td>${formatarMoeda(item.valorUnitario)}</td>` : ''}
              ${showTotalPrice ? `<td>${formatarMoeda(item.valorTotal)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px 4px;
          text-align: center;
        }
        th {
          background-color: #f2f2f2;
          font-size: 11px;
          font-weight: bold;
        }
        td {
          font-size: 12px;
        }
        td:nth-child(2) {
          text-align: left;
        }
      </style>
    `;
  };

  // Função para gerar o conteúdo completo para impressão
  const generatePrintContent = () => {
    // Determinar qual tipo de romaneio está sendo impresso
    let itemsContent = '';
    
    if (romaneio.tipo === 'TL') {
      itemsContent = renderRomaneioTLItems((romaneio as RomaneioTL).itens);
    } else if (romaneio.tipo === 'PC') {
      itemsContent = renderRomaneioPCItems((romaneio as RomaneioPC).itens);
    } else if (romaneio.tipo === 'PES') {
      itemsContent = renderRomaneioPESItems((romaneio as RomaneioPES).itens);
    }
    
    // Obter os dados da empresa, incluindo logo
    console.log('PrintRomaneio: Obtendo dados da empresa...');
    const companyData = getCompanyData();
    console.log('PrintRomaneio: Dados da empresa obtidos:', companyData);
    
    // Usar um título vazio para ocultar o título do romaneio na impressão
    const headerTitle = '';
    console.log('PrintRomaneio: Gerando cabeçalho sem título');
    
    // Gerar o resumo apenas para romaneios TL e PC
    const resumoContent = (romaneio.tipo === 'TL' || romaneio.tipo === 'PC') 
      ? renderResumo(romaneio.itens)
      : '';
    
    const content = `
      ${generateHeader(headerTitle, undefined, companyData)}
      ${renderRomaneioHeader()}
      ${itemsContent}
      ${renderTotals()}
      ${resumoContent}
    `;
    
    return content;
  };

  // Função para renderizar os totais
  const renderTotals = () => {
    const showPrices = printOption !== PrintOptions.NO_PRICE;
    
    return `
      <div class="totals">
        <p><strong>Volume Total:</strong> ${formatarVolume(romaneio.volumeTotal)} m³</p>
        ${showPrices && romaneio.valorTotal ? `<p><strong>Valor Total:</strong> ${formatarMoeda(romaneio.valorTotal)}</p>` : ''}
      </div>
    `;
  };

  // Executar impressão
  React.useEffect(() => {
    const content = generatePrintContent();
    // Adiciona um timestamp único ao título para evitar duplicação
    const uniqueId = Date.now().toString().slice(-4);
    // O título é usado apenas para identificar a janela de impressão, não aparece no documento
    const title = `Romaneio ${romaneio.tipo} - ${romaneio.numero} (${uniqueId})`;
    
    printContent(content, title);
    
    if (onClose) {
      onClose();
    }
  }, []);

  // O componente não renderiza nada na tela, apenas executa a impressão
  return null;
};

export default PrintRomaneio;