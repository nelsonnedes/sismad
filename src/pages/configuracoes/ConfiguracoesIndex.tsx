import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';

// Componentes estilizados
const Container = styled.div`
  padding: 20px;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled(Link)`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: 20px;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const CardIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const CardDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
`;

const ConfiguracoesIndex: React.FC = () => {
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.tipo === 'admin';
  
  return (
    <Container>
      <PageHeader 
        title="Configurações" 
        description="Gerencie as configurações do sistema"
      />
      
      <CardContainer>
        <Card to="/configuracoes/empresa">
          <CardIcon>
            <i className="fas fa-building"></i>
          </CardIcon>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Gerencie os dados cadastrais da empresa' 
              : 'Visualize os dados cadastrais da empresa'}
          </CardDescription>
        </Card>
        
        {isAdmin && (
          <Card to="/configuracoes/usuarios">
            <CardIcon>
              <i className="fas fa-users"></i>
            </CardIcon>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>
              Gerencie os usuários que têm acesso ao sistema
            </CardDescription>
          </Card>
        )}
        
        {/* Pode adicionar mais cards de configuração conforme necessário */}
      </CardContainer>
    </Container>
  );
};

export default ConfiguracoesIndex; 