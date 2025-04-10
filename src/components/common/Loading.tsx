import React from 'react';
import styled, { keyframes } from 'styled-components';
import LogoSVG from '../../assets/logo.svg';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;
  border-radius: 50%;
  background-color: white;
  
  img {
    width: 60px;
    height: 60px;
  }
`;

const LoadingText = styled.div`
  margin-top: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: bold;
`;

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...' }) => {
  return (
    <LoadingContainer>
      <LogoContainer>
        <img src={LogoSVG} alt="SISMAD Logo" />
      </LogoContainer>
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default Loading; 