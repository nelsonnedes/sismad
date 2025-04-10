import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { clientesService, romaneiosService, orcamentosService } from '../services/firebaseService';
import { ThemeType } from '../styles/theme';

interface StyledProps {
  theme: ThemeType;
}

// Styled Components
const Container = styled.div`
  padding: 0;
`;

const DashboardHeader = styled.div`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  padding: 25px 30px;
  color: white;
  border-radius: 0;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: white;
  font-weight: 500;
`;

const Subtitle = styled.p`
  opacity: 0.8;
  margin: 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: -30px 20px 30px 20px;
  position: relative;
`;

const Card = styled.div`
  background: white;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  color: ${(props: StyledProps) => props.theme.colors.secondary};
  margin-bottom: 15px;
  font-weight: 500;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${(props: StyledProps) => props.theme.colors.primary};
  margin-bottom: 10px;
`;

const CardInfo = styled.div`
  font-size: 0.9rem;
  color: ${(props: StyledProps) => props.theme.colors.secondary};
  margin-top: auto;
`;

const ContentSection = styled.div`
  padding: 0 20px 20px 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: ${(props: StyledProps) => props.theme.colors.text};
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  }
  
  th {
    background-color: ${(props: StyledProps) => props.theme.colors.light};
    font-weight: 500;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;

// Componente Dashboard
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalEspecies: 0,
    totalRomaneios: 0,
    totalOrcamentos: 0,
    volumeTotal: 0,
    orcamentosAprovados: 0,
    orcamentosPendentes: 0
  });
  
  const [recentRomaneios, setRecentRomaneios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar dados das coleções
        const [clientes, romaneios, orcamentos] = await Promise.all([
          clientesService.getAll(),
          romaneiosService.getAll(),
          orcamentosService.getAll()
        ]);
        
        console.log('Dashboard - romaneios carregados:', romaneios.length);
        
        // Calcular estatísticas
        const volumeTotal = romaneios.reduce((sum, romaneio) => sum + romaneio.volumeTotal, 0);
        const orcamentosAprovados = orcamentos.filter(orc => orc.status === 'aprovado').length;
        const orcamentosPendentes = orcamentos.filter(orc => orc.status === 'pendente').length;
        
        setStats({
          totalClientes: clientes.length,
          totalEspecies: 3, // Mockado por enquanto
          totalRomaneios: romaneios.length,
          totalOrcamentos: orcamentos.length,
          volumeTotal,
          orcamentosAprovados,
          orcamentosPendentes
        });
        
        // Ordenar romaneios por data (mais recentes primeiro)
        const sortedRomaneios = [...romaneios].sort(
          (a, b) => {
            // Garantir que as datas são objetos Date
            const dateA = a.dataCriacao instanceof Date ? a.dataCriacao : new Date(a.dataCriacao);
            const dateB = b.dataCriacao instanceof Date ? b.dataCriacao : new Date(b.dataCriacao);
            return dateB.getTime() - dateA.getTime();
          }
        ).slice(0, 5); // Pegar os 5 mais recentes
        
        console.log('Dashboard - romaneios ordenados:', sortedRomaneios.length);
        
        // Adicionar dados de clientes e espécies
        const romaneiosWithDetails = await Promise.all(sortedRomaneios.map(async romaneio => {
          try {
            const cliente = await clientesService.getById(romaneio.cliente);
            return {
              ...romaneio,
              clienteNome: cliente ? cliente.nome : 'Cliente não encontrado'
            };
          } catch (error) {
            console.error(`Erro ao obter detalhes do cliente para romaneio ${romaneio.id}:`, error);
            return {
              ...romaneio,
              clienteNome: 'Erro ao carregar cliente'
            };
          }
        }));
        
        console.log('Dashboard - romaneios com detalhes:', romaneiosWithDetails.length);
        setRecentRomaneios(romaneiosWithDetails);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Função para formatar datas
  const formatDate = (date: any) => {
    if (!date) return 'Data inválida';
    try {
      // Verificar se date é um objeto Date ou precisa ser convertido
      const dateObj = date instanceof Date ? date : new Date(date);
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) return 'Data inválida';
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return 'Data inválida';
    }
  };
  
  // Função para formatar volume
  const formatVolume = (volume: number) => {
    return volume.toFixed(3).replace('.', ',');
  };
  
  if (loading) {
    return <Container>Carregando dados...</Container>;
  }
  
  return (
    <Container>
      <DashboardHeader>
      <Title>Dashboard</Title>
        <Subtitle>Visão geral do sistema</Subtitle>
      </DashboardHeader>
      
      <CardGrid>
        <Card>
          <CardTitle>Total de Clientes</CardTitle>
          <CardValue>{stats.totalClientes}</CardValue>
          <CardInfo>Cadastrados no sistema</CardInfo>
        </Card>
        
        <Card>
          <CardTitle>Romaneios Emitidos</CardTitle>
          <CardValue>{stats.totalRomaneios}</CardValue>
          <CardInfo>Total de documentos</CardInfo>
        </Card>
        
        <Card>
          <CardTitle>Volume de Madeira</CardTitle>
          <CardValue>{formatVolume(stats.volumeTotal)} m³</CardValue>
          <CardInfo>Volume total em metros cúbicos</CardInfo>
        </Card>
        
        <Card>
          <CardTitle>Orçamentos</CardTitle>
          <CardValue>{stats.totalOrcamentos}</CardValue>
          <CardInfo>{stats.orcamentosAprovados} aprovados, {stats.orcamentosPendentes} pendentes</CardInfo>
        </Card>
      </CardGrid>
      
      <ContentSection>
      <Section>
        <SectionTitle>Romaneios Recentes</SectionTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {recentRomaneios.length > 0 ? (
                recentRomaneios.map(romaneio => (
                  <tr key={romaneio.id}>
                    <td>{romaneio.numero || 'N/A'}</td>
                    <td>{romaneio.clienteNome || 'Cliente não encontrado'}</td>
                    <td>
                      {romaneio.tipo === 'TL' && 'Toda Largura'}
                      {romaneio.tipo === 'PC' && 'Pacote'}
                      {romaneio.tipo === 'PES' && 'Cubagem em Pés'}
                      {romaneio.tipo === 'TR' && 'Toras'}
                      {!romaneio.tipo && 'Tipo desconhecido'}
                    </td>
                    <td>{formatDate(romaneio.dataCriacao)}</td>
                    <td>{formatVolume(romaneio.volumeTotal)} m³</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Nenhum romaneio encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableContainer>
      </Section>
      </ContentSection>
    </Container>
  );
};

export default Dashboard; 