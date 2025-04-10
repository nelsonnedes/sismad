import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PageHeader from '../../components/PageHeader';

// Interface para os props dos styled-components com tema
interface ThemedProps {
  theme: any;
}

const Container = styled.div`
  padding: 20px;
`;

const SectionTitle = styled.h2<{ theme: any }>`
  color: ${({ theme }: ThemedProps) => theme.colors.primary};
  margin-bottom: 20px;
`;

const ButtonLink = styled(Link)<{ theme: any }>`
  display: inline-block;
  background-color: ${({ theme }: ThemedProps) => theme.colors.primary};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  margin-right: 10px;
  
  &:hover {
    background-color: #0b5ed7;
  }
`;

const OrcamentosIndex: React.FC = () => {
  console.log("Renderizando OrcamentosIndex...");
  
  return (
    <Container>
      <PageHeader
        title="Orçamentos"
        description="Sistema de gerenciamento de orçamentos para produtos de madeira."
      />
      
      <SectionTitle>Escolha uma opção:</SectionTitle>
      
      <div style={{ marginTop: '20px' }}>
        <ButtonLink to="/orcamentos/lista">Lista de Orçamentos</ButtonLink>
        <ButtonLink to="/orcamentos/novo">Novo Orçamento</ButtonLink>
      </div>
    </Container>
  );
};

export default OrcamentosIndex; 