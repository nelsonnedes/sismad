import React from 'react';
import styled from 'styled-components';

interface LogoDisplayProps {
  src: string | null;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const ImageContainer = styled.div<{ width?: number; height?: number }>`
  width: ${props => props.width ? `${props.width}px` : '100%'};
  height: ${props => props.height ? `${props.height}px` : 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const Placeholder = styled.div<{ width?: number; height?: number }>`
  width: ${props => props.width ? `${props.width}px` : '100%'};
  height: ${props => props.height ? `${props.height}px` : '150px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  font-size: 14px;
`;

/**
 * Componente para exibir uma logo, suportando tanto URLs quanto Base64
 */
const LogoDisplay: React.FC<LogoDisplayProps> = ({ 
  src, 
  alt = 'Logo', 
  width, 
  height,
  className 
}) => {
  // Verifica se a fonte da imagem é válida
  const isValidSrc = (src: string | null): boolean => {
    if (!src) return false;
    
    // Verifica se é uma URL ou Base64
    return src.startsWith('http') || src.startsWith('https') || src.startsWith('data:image');
  };

  if (!isValidSrc(src)) {
    return (
      <Placeholder width={width} height={height} className={className}>
        Sem logo
      </Placeholder>
    );
  }

  return (
    <ImageContainer width={width} height={height} className={className}>
      <Image src={src!} alt={alt} />
    </ImageContainer>
  );
};

export default LogoDisplay; 