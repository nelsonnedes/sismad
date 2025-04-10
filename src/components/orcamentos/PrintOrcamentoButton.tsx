import React, { useState, useRef, useCallback } from 'react';
import { PrintOptions } from '../../utils/printing';
import PrintOrcamento, { 
  Orcamento, 
  PrintButton, 
  PrintMenu 
} from './PrintOrcamento';

// Variável de controle global para evitar múltiplos cliques em diferentes instâncias
// do componente PrintOrcamentoButton
let isGlobalPrintingInProgress = false;

interface PrintOrcamentoButtonProps {
  orcamento?: Orcamento;
  disabled?: boolean;
  buttonText?: string;
  onPrintRequest?: (option: PrintOptions) => void;
}

/**
 * Botão de impressão para Orçamentos com menu de opções
 */
const PrintOrcamentoButton: React.FC<PrintOrcamentoButtonProps> = ({ 
  orcamento, 
  disabled = false,
  buttonText = 'Imprimir',
  onPrintRequest
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [currentOption, setCurrentOption] = useState<PrintOptions | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  // Controle de tempo entre cliques para evitar impressões duplicadas
  const isClickAllowed = useRef<boolean>(true);

  // Função para imprimir diretamente com uma opção específica
  const printDirect = useCallback((option: PrintOptions) => {
    if (!isClickAllowed.current || isPrinting || isGlobalPrintingInProgress || !orcamento) return;
    
    isGlobalPrintingInProgress = true;
    setIsPrinting(true);
    setCurrentOption(option);
  }, [isPrinting, orcamento]);

  // Manipula o clique no botão para exibir o menu
  const handleButtonClick = useCallback(() => {
    // Bloquear se já existe qualquer impressão em andamento, seja neste componente ou em outro
    if (!isClickAllowed.current || isPrinting || isGlobalPrintingInProgress) return;
    
    // Bloquear cliques por 500ms
    isClickAllowed.current = false;
    
    // Reabilitar cliques após 500ms
    setTimeout(() => {
      isClickAllowed.current = true;
    }, 500);
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      // Calcular posição relativa à viewport em vez de ao documento
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      setShowMenu(true);
    }
  }, [isPrinting]);

  // Manipula a seleção de uma opção de impressão
  const handleOptionSelect = useCallback((option: PrintOptions) => {
    // Bloquear se já existe qualquer impressão em andamento
    if (isPrinting || isGlobalPrintingInProgress) return;
    
    // Marcar globalmente que uma impressão está em andamento
    isGlobalPrintingInProgress = true;
    
    // Limpar qualquer timeout pendente
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }
    
    setIsPrinting(true);
    setCurrentOption(option);
    setShowMenu(false);
  }, [isPrinting]);

  // Manipula o fechamento do menu
  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  // Manipula o fechamento do componente de impressão
  const handleClosePrint = useCallback(() => {
    setCurrentOption(null);
    
    // Usar um pequeno atraso para evitar cliques subsequentes
    clickTimeoutRef.current = window.setTimeout(() => {
      setIsPrinting(false);
      // Liberar o bloqueio global apenas depois do atraso
      isGlobalPrintingInProgress = false;
      clickTimeoutRef.current = null;
    }, 2000); // Aumentado para 2 segundos para evitar cliques rápidos
  }, []);

  // Adicionar listener para o evento customizado
  React.useEffect(() => {
    const handlePrintEvent = (event: CustomEvent) => {
      const { printOption } = event.detail;
      if (printOption === 'COMPLETE') {
        printDirect(PrintOptions.COMPLETE);
      }
    };

    const button = buttonRef.current;
    if (button) {
      button.addEventListener('print-orcamento', handlePrintEvent as EventListener);
    }

    return () => {
      if (button) {
        button.removeEventListener('print-orcamento', handlePrintEvent as EventListener);
      }
    };
  }, [printDirect]);

  // Limpar timeout quando o componente for desmontado
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <PrintButton 
        ref={buttonRef}
        onClick={handleButtonClick} 
        disabled={disabled || !orcamento || isPrinting || isGlobalPrintingInProgress}
      >
        <i className="fas fa-print"></i> {buttonText}
      </PrintButton>

      {showMenu && !isPrinting && !isGlobalPrintingInProgress && (
        <PrintMenu 
          position={menuPosition} 
          onSelect={handleOptionSelect}
          onClose={handleCloseMenu}
        />
      )}

      {currentOption !== null && orcamento && isPrinting && (
        <PrintOrcamento 
          orcamento={orcamento} 
          printOption={currentOption}
          onClose={handleClosePrint}
        />
      )}
    </>
  );
};

export default PrintOrcamentoButton; 