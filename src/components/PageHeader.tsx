import React from 'react';
import styled from 'styled-components';
import { ThemeType } from '../styles/theme';

interface PageHeaderProps {
  title: string;
  description?: string;
}

interface StyledProps {
  theme: ThemeType;
}

const HeaderContainer = styled.div`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  padding: 25px 30px;
  color: white;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: white;
  font-weight: 600;
`;

const Description = styled.p`
  opacity: 0.9;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
`;

/**
 * Componente padrão para tarja azul de cabeçalho usado em todas as páginas do sistema
 * @param title - Título da página
 * @param description - Descrição opcional da página
 */
const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
    </HeaderContainer>
  );
};

export default PageHeader; 