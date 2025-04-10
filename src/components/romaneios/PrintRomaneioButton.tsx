import React, { useState, useRef, useCallback } from 'react';
import { PrintOptions } from '../../utils/printing';
import PrintRomaneio, { 
  Romaneio, 
  PrintButton, 
  PrintMenu 
} from './PrintRomaneio';

// Variável de controle global para evitar múltiplos cliques em diferentes instâncias
// do componente PrintRomaneioButton
let isGlobalPrintingInProgress = false;

interface PrintRomaneioButtonProps {
  romaneio?: Romaneio;
  disabled?: boolean;
  buttonText?: string;
}

/**
 * Botão de impressão para Romaneios com menu de opções
 */
const PrintRomaneioButton: React.FC<PrintRomaneioButtonProps> = ({ 
  romaneio, 
  disabled = false,
  buttonText = 'Imprimir'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [currentOption, setCurrentOption] = useState<PrintOptions | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  // Controle de tempo entre cliques para evitar impressões duplicadas
  const isClickAllowed = useRef<boolean>(true);

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
        top: rect.bottom,
        left: rect.left
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
        disabled={disabled || !romaneio || isPrinting || isGlobalPrintingInProgress}
        title="Imprimir"
      >
        <i className="fas fa-print"></i>
      </PrintButton>

      {showMenu && !isPrinting && !isGlobalPrintingInProgress && (
        <PrintMenu 
          position={menuPosition} 
          onSelect={handleOptionSelect}
          onClose={handleCloseMenu}
        />
      )}

      {currentOption !== null && romaneio && isPrinting && (
        <PrintRomaneio 
          romaneio={romaneio} 
          printOption={currentOption}
          onClose={handleClosePrint}
        />
      )}
    </>
  );
};

export default PrintRomaneioButton; 