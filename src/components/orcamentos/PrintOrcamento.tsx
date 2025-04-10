import React from 'react';
import styled from 'styled-components';
import { PrintOptions, printContent, generateHeader, getCompanyLogo, getCompanyData } from '../../utils/printing';
import { formatarMoeda } from '../../utils/madeira';

// Tipos e Interfaces
export interface Orcamento {
  id: string;
  numero: string;
  cliente: string;
  clienteNome?: string;
  dataOrcamento: Date;
  dataValidade: Date;
  observacoes?: string;
  formaPagamento?: string;
  prazoEntrega?: string;
  itens: OrcamentoItem[];
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'vencido';
}

export interface OrcamentoItem {
  id: number;
  descricao: string;
  especie: string;
  especieNome?: string;
  quantidade: number | string;
  unidade: string;
  largura?: number;
  altura?: number;
  comprimento?: number;
  valorUnitario: number;
  valorTotal: number;
}

interface PrintOrcamentoProps {
  orcamento: Orcamento;
  printOption: PrintOptions;
  onClose?: () => void;
}

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

export const PrintOptionsHeader = styled.div`
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
  color: #555;
`;

export const PrintOptionsContent = styled.div`
  padding: 8px 0;
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

// Component para o botão de impressão
export const PrintButton = styled.button`
  background-color: #4a6da7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #385582;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Interface para as props do menu de impressão
interface PrintMenuProps {
  position: { top: number; left: number };
  onSelect: (option: PrintOptions) => void;
  onClose: () => void;
}

// Componente para exibir o menu de opções de impressão
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

// Componente principal para impressão de orçamento
const PrintOrcamento: React.FC<PrintOrcamentoProps> = ({ orcamento, printOption, onClose }) => {
  // Função para renderizar cabeçalho do orçamento
  const renderOrcamentoHeader = () => {
    const formattedDataOrcamento = new Date(orcamento.dataOrcamento).toLocaleDateString('pt-BR');
    const formattedDataValidade = new Date(orcamento.dataValidade).toLocaleDateString('pt-BR');
    
    return `
      <div class="orcamento-header">
        <div class="header-row">
          <span><strong>Número:</strong> ${orcamento.numero}</span>
          <span><strong>Data:</strong> ${formattedDataOrcamento}</span>
          <span><strong>Validade:</strong> ${formattedDataValidade}</span>
          <span><strong>Cliente:</strong> ${orcamento.clienteNome || 'Cliente não especificado'}</span>
        </div>
        
        ${(orcamento.formaPagamento || orcamento.prazoEntrega) ? `
          <div class="header-row">
            ${orcamento.formaPagamento ? `<span><strong>Forma de Pagamento:</strong> ${orcamento.formaPagamento}</span>` : ''}
            ${orcamento.prazoEntrega ? `<span><strong>Prazo de Entrega:</strong> ${orcamento.prazoEntrega}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <style>
        .orcamento-header {
          margin-bottom: 20px;
        }
        .header-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
          margin-bottom: 8px;
        }
        .header-row:last-child {
          margin-bottom: 0;
        }
        .header-row span {
          margin-right: 15px;
          margin-bottom: 5px;
        }
        @media print {
          .header-row {
            page-break-inside: avoid;
          }
        }
      </style>
    `;
  };

  // Função para renderizar a tabela de itens do orçamento
  const renderOrcamentoItems = (items: OrcamentoItem[]) => {
    const showUnitPrice = printOption !== PrintOptions.NO_PRICE;
    const showTotalPrice = printOption !== PrintOptions.NO_PRICE;
    const showUnitPriceColumn = printOption === PrintOptions.COMPLETE;
    
    return `
      <table>
        <thead>
          <tr>
            <th>Nº</th>
            <th>Descrição</th>
            <th>Espécie</th>
            <th>Dimensões</th>
            <th>Qtde</th>
            <th>Unidade</th>
            ${showUnitPriceColumn ? '<th>Valor Unitário</th>' : ''}
            ${showTotalPrice ? '<th>Valor Total</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => {
            // Preparar string de dimensões conforme valores disponíveis
            let dimensoesStr = '-';
            if (item.altura) {
              if (item.largura && item.comprimento) {
                dimensoesStr = `${item.altura}×${item.largura}×${item.comprimento}`;
              } else if (item.largura) {
                dimensoesStr = `${item.altura}×${item.largura}`;
              } else {
                dimensoesStr = `${item.altura}`;
              }
            }
            
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${item.descricao}</td>
                <td>${item.especieNome || item.especie || '-'}</td>
                <td>${dimensoesStr}</td>
                <td>${item.quantidade}</td>
                <td>${item.unidade}</td>
                ${showUnitPriceColumn ? `<td>${formatarMoeda(item.valorUnitario)}</td>` : ''}
                ${showTotalPrice ? `<td>${formatarMoeda(item.valorTotal)}</td>` : ''}
              </tr>
            `;
          }).join('')}
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
          text-align: left;
        }
        td:first-child, 
        td:nth-child(4), 
        td:nth-child(5), 
        td:nth-child(6),
        td:nth-child(7),
        td:nth-child(8) {
          text-align: center;
        }
      </style>
    `;
  };

  // Função para renderizar totais
  const renderTotals = () => {
    if (printOption === PrintOptions.NO_PRICE) {
      return '';
    }

    return `
      <div class="totals">
        <p><strong>Valor Total: ${formatarMoeda(orcamento.valorTotal)}</strong></p>
      </div>
    `;
  };

  // Função para renderizar observações
  const renderObservacoes = () => {
    if (!orcamento.observacoes) return '';

    return `
      <div class="observations">
        <h3>Observações</h3>
        <p>${orcamento.observacoes}</p>
      </div>
    `;
  };

  // Gerar conteúdo HTML completo para impressão
  const generatePrintContent = () => {
    console.log('PrintOrcamento: Iniciando geração do conteúdo para impressão');
    
    // Obter dados da empresa para impressão
    console.log('PrintOrcamento: Obtendo dados da empresa...');
    const companyData = getCompanyData();
    console.log('PrintOrcamento: Dados da empresa obtidos:', companyData);
    
    // Usar um título vazio para ocultar o título do orçamento na impressão
    const headerTitle = '';
    console.log('PrintOrcamento: Gerando cabeçalho sem título');
    
    const content = `
      ${generateHeader(headerTitle, undefined, companyData)}
      <div class="status-banner status-${orcamento.status}">
        ${orcamento.status === 'aprovado' ? 'APROVADO' : 
          orcamento.status === 'recusado' ? 'RECUSADO' : 
          orcamento.status === 'vencido' ? 'VENCIDO' : 'PENDENTE'}
      </div>
      ${renderOrcamentoHeader()}
      ${renderOrcamentoItems(orcamento.itens)}
      ${renderObservacoes()}
      ${renderTotals()}
      
      <style>
        .status-banner {
          background-color: #f8f9fa;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .status-aprovado {
          background-color: rgba(25, 135, 84, 0.1);
          color: #198754;
        }
        .status-recusado {
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        .status-vencido {
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }
        .status-pendente {
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        .observations {
          margin-top: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
      </style>
    `;
    
    console.log('PrintOrcamento: Conteúdo gerado com sucesso');
    return content;
  };

  // Executar impressão
  React.useEffect(() => {
    const content = generatePrintContent();
    // Adiciona um timestamp único ao título para evitar duplicação
    const uniqueId = Date.now().toString().slice(-4);
    // O título é usado apenas para identificar a janela de impressão, não aparece no documento
    const title = `Orçamento - ${orcamento.numero} (${uniqueId})`;
    
    printContent(content, title);
    
    if (onClose) {
      onClose();
    }
  }, []);

  // O componente não renderiza nada na tela, apenas executa a impressão
  return null;
};

export default PrintOrcamento; 