import React, { useState, useRef } from 'react';
import { PrintOptions } from '../../utils/printing';
import PrintRomaneio, { 
  Romaneio, 
  PrintButton, 
  PrintMenu 
} from './PrintRomaneio';

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Manipula o clique no botão para exibir o menu
  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      setShowMenu(true);
    }
  };

  // Manipula a seleção de uma opção de impressão
  const handleOptionSelect = (option: PrintOptions) => {
    setCurrentOption(option);
    setShowMenu(false);
  };

  // Manipula o fechamento do menu
  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  // Manipula o fechamento do componente de impressão
  const handleClosePrint = () => {
    setCurrentOption(null);
  };

  return (
    <>
      <PrintButton 
        ref={buttonRef}
        onClick={handleButtonClick} 
        disabled={disabled || !romaneio}
      >
        <i className="fas fa-print"></i> {buttonText}
      </PrintButton>

      {showMenu && (
        <PrintMenu 
          position={menuPosition} 
          onSelect={handleOptionSelect}
          onClose={handleCloseMenu}
        />
      )}

      {currentOption !== null && romaneio && (
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