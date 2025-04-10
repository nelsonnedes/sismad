import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.large};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.large};
  transition: all ${({ theme }) => theme.transitions.default};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const CardTitle = styled.h2`
  color: ${({ theme }) => theme.colors.dark};
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const CardValue = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: bold;
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

const Dashboard: React.FC = () => {
  return (
    <Container>
      <h1>Dashboard SISMAD</h1>
      
      <GridContainer>
        <Card>
          <CardTitle>Romaneios Emitidos</CardTitle>
          <CardValue>42</CardValue>
          <InfoText>Este mês</InfoText>
        </Card>
        
        <Card>
          <CardTitle>Volume Total</CardTitle>
          <CardValue>156,8 m³</CardValue>
          <InfoText>Este mês</InfoText>
        </Card>
        
        <Card>
          <CardTitle>Clientes Ativos</CardTitle>
          <CardValue>18</CardValue>
          <InfoText>Últimos 30 dias</InfoText>
        </Card>
        
        <Card>
          <CardTitle>Orçamentos</CardTitle>
          <CardValue>12</CardValue>
          <InfoText>Pendentes</InfoText>
        </Card>
      </GridContainer>
      
      <Card>
        <CardTitle>Informações do Sistema</CardTitle>
        <InfoText>Bem-vindo ao SISMAD - Sistema de Gestão para Madeireiras</InfoText>
        <InfoText>Utilize o menu lateral para acessar as funcionalidades do sistema.</InfoText>
        <InfoText>Versão: 1.0.0</InfoText>
      </Card>
    </Container>
  );
};

export default Dashboard; 