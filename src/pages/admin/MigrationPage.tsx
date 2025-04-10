import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { migrateDataToFirebase, checkFirebaseData } from '../../services/firebaseService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #2c3e50;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const StatusSection = styled.div`
  margin-bottom: 20px;
`;

const StatusTitle = styled.h3`
  margin-bottom: 10px;
  color: #34495e;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 500;
`;

const Value = styled.span`
  color: #3498db;
  font-weight: 600;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #2ecc71;
  color: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  background-color: #e74c3c;
  color: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  margin: 10px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MigrationPage: React.FC = () => {
  const [databaseStatus, setDatabaseStatus] = useState({
    clientesCount: 0,
    especiesCount: 0,
    romaneiosCount: 0,
    orcamentosCount: 0,
    isEmpty: true
  });
  
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    checkDatabaseStatus();
  }, []);
  
  const checkDatabaseStatus = async () => {
    try {
      setLoading(true);
      const status = await checkFirebaseData();
      setDatabaseStatus(status);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro ao verificar status do banco de dados: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleMigrateData = async () => {
    try {
      setMigrating(true);
      setMessage({ type: '', text: '' });
      
      const result = await migrateDataToFirebase();
      
      if (result.success) {
        const counts = result.counts || { clientes: 0, especies: 0, romaneios: 0, orcamentos: 0 };
        setMessage({
          type: 'success',
          text: `Migração concluída com sucesso! Foram migrados: ${counts.clientes} clientes, ${counts.especies} espécies, ${counts.romaneios} romaneios e ${counts.orcamentos} orçamentos.`
        });
        
        // Atualizar o status após a migração
        await checkDatabaseStatus();
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Erro durante a migração: ${error}`
      });
    } finally {
      setMigrating(false);
    }
  };
  
  return (
    <Container>
      <Title>Migração de Dados para Firebase</Title>
      
      <Card>
        <StatusSection>
          <StatusTitle>Status Atual do Firebase</StatusTitle>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <StatusItem>
                <Label>Banco de dados vazio:</Label>
                <Value>{databaseStatus.isEmpty ? 'Sim' : 'Não'}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Clientes:</Label>
                <Value>{databaseStatus.clientesCount}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Espécies:</Label>
                <Value>{databaseStatus.especiesCount}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Romaneios:</Label>
                <Value>{databaseStatus.romaneiosCount}</Value>
              </StatusItem>
              <StatusItem>
                <Label>Orçamentos:</Label>
                <Value>{databaseStatus.orcamentosCount}</Value>
              </StatusItem>
            </>
          )}
        </StatusSection>
        
        <Button onClick={checkDatabaseStatus} disabled={loading}>
          Atualizar Status
        </Button>
        
        <Button 
          onClick={handleMigrateData} 
          disabled={migrating || !databaseStatus.isEmpty}
        >
          {migrating ? 'Migrando...' : 'Iniciar Migração'}
        </Button>
        
        {!databaseStatus.isEmpty && (
          <ErrorMessage>
            O banco de dados já contém dados. A migração só pode ser executada em um banco de dados vazio.
          </ErrorMessage>
        )}
        
        {migrating && <LoadingSpinner />}
        
        {message.type === 'success' && (
          <SuccessMessage>{message.text}</SuccessMessage>
        )}
        
        {message.type === 'error' && (
          <ErrorMessage>{message.text}</ErrorMessage>
        )}
      </Card>
      
      <Card>
        <StatusTitle>Instruções</StatusTitle>
        <p>
          Esta página permite migrar os dados mockados para o Firebase. A migração só pode ser executada
          em um banco de dados vazio para evitar duplicação de dados.
        </p>
        <p>
          Após a migração, você precisará mudar a flag <strong>USE_REAL_FIREBASE</strong> para <strong>true</strong> 
          no arquivo <strong>src/services/firebaseService.ts</strong> para começar a usar os dados reais.
        </p>
        <p>
          <strong>Importante:</strong> Faça backup dos dados antes de realizar qualquer alteração no código.
        </p>
      </Card>
    </Container>
  );
};

export default MigrationPage; 