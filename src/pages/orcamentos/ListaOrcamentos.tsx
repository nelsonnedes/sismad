import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, orderBy, where, DocumentData, QuerySnapshot, QueryDocumentSnapshot, DocumentSnapshot, FirestoreDataConverter, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatarMoeda } from '../../utils/madeira';
import { Link, useNavigate } from 'react-router-dom';
import PrintOrcamentoButton from '../../components/orcamentos/PrintOrcamentoButton';
import { ThemeType } from '../../styles/theme';
import PageHeader from '../../components/PageHeader';
import { PrintOptions } from '../../utils/printing';
import ReactDOM from 'react-dom';
import PrintOrcamento from '../../components/orcamentos/PrintOrcamento';

// Interface para o tema do styled-components
interface StyledProps {
  theme: ThemeType;
  $active?: boolean;
  $status?: string;
}

// Interfaces
interface Cliente {
  id: string;
  nome: string;
}

interface OrcamentoItem {
  id: number;
  descricao: string;
  especie: string;
  especieNome?: string;
  quantidade: number;
  unidade: string;
  largura?: number;
  altura?: number;
  comprimento?: number;
  valorUnitario: number;
  valorTotal: number;
}

interface Orcamento {
  id: string;
  numero: string;
  cliente: string;
  clienteNome?: string;
  dataOrcamento: Date;
  dataValidade: Date;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'vencido' | 'em_producao' | 'finalizado';
  formaPagamento?: string;
  prazoEntrega?: string;
  observacoes?: string;
  itens: OrcamentoItem[];
}

// Styled Components
const Container = styled.div`
  padding: ${({ theme }: StyledProps) => theme.spacing.large};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }: StyledProps) => theme.spacing.medium};
  }
`;

const SectionTitle = styled.h2`
  color: ${({ theme }: StyledProps) => theme.colors.primary};
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }: StyledProps) => theme.spacing.medium};
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 180px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.small};
  font-weight: 500;
  font-size: 0.875rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }: StyledProps) => theme.colors.border};
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  background-color: ${({ theme }: StyledProps) => theme.colors.cardBackground};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }: StyledProps) => theme.colors.border};
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  background-color: ${({ theme }: StyledProps) => theme.colors.cardBackground};
`;

const Card = styled.div`
  background-color: ${({ theme }: StyledProps) => theme.colors.cardBackground};
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.medium};
  box-shadow: ${({ theme }: StyledProps) => theme.shadows.small};
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};
  overflow: hidden;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }: StyledProps) => theme.colors.border};
  }
  
  th {
    background-color: ${({ theme }: StyledProps) => theme.colors.light};
    color: ${({ theme }: StyledProps) => theme.colors.dark};
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  tr:hover {
    background-color: ${({ theme }: StyledProps) => theme.colors.light};
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-width: 110px;
  
  i {
    margin-right: 8px;
    font-size: 1rem;
  }
  
  ${({ $status, theme }: StyledProps) => {
    switch ($status) {
      case 'aprovado':
        return `
          background-color: rgba(25, 135, 84, 0.15);
          color: ${theme.colors.success};
          border: 1px solid rgba(25, 135, 84, 0.3);
        `;
      case 'recusado':
        return `
          background-color: rgba(220, 53, 69, 0.15);
          color: ${theme.colors.danger};
          border: 1px solid rgba(220, 53, 69, 0.3);
        `;
      case 'vencido':
        return `
          background-color: rgba(108, 117, 125, 0.15);
          color: ${theme.colors.secondary};
          border: 1px solid rgba(108, 117, 125, 0.3);
        `;
      case 'em_producao':
        return `
          background-color: rgba(13, 110, 253, 0.15);
          color: ${theme.colors.primary};
          border: 1px solid rgba(13, 110, 253, 0.3);
        `;
      case 'finalizado':
        return `
          background-color: rgba(25, 135, 84, 0.15);
          color: ${theme.colors.success};
          border: 1px solid rgba(25, 135, 84, 0.3);
        `;
      default:
        return `
          background-color: rgba(255, 193, 7, 0.15);
          color: ${theme.colors.warning};
          border: 1px solid rgba(255, 193, 7, 0.3);
        `;
    }
  }}
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }: StyledProps) => theme.colors.primary};
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.875rem;
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  transition: background-color ${({ theme }: StyledProps) => theme.transitions.default};
  
  &:hover {
    background-color: rgba(13, 110, 253, 0.1);
  }
  
  &:not(:last-child) {
    margin-right: ${({ theme }: StyledProps) => theme.spacing.small};
  }
`;

const StyledLink = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }: StyledProps) => theme.colors.primary};
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  text-decoration: none;
  transition: background-color ${({ theme }: StyledProps) => theme.transitions.default};
  
  &:hover {
    background-color: #0b5ed7;
    color: white;
  }
  
  i {
    margin-right: ${({ theme }: StyledProps) => theme.spacing.small};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }: StyledProps) => theme.spacing.medium};
  gap: ${({ theme }: StyledProps) => theme.spacing.small};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.small};
  border: 1px solid ${({ theme, $active }: StyledProps) => $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $active }: StyledProps) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }: StyledProps) => $active ? 'white' : theme.colors.text};
  cursor: pointer;
  transition: all ${({ theme }: StyledProps) => theme.transitions.default};
  
  &:hover {
    background-color: ${({ theme, $active }: StyledProps) => $active ? '#0b5ed7' : theme.colors.light};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }: StyledProps) => theme.spacing.large};
  color: ${({ theme }: StyledProps) => theme.colors.secondary};
  
  i {
    font-size: 3rem;
    margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};
    display: block;
  }
`;

// Adicione um novo componente estilizado para alinhar os ícones na coluna Ações
const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  justify-content: flex-start;
  align-items: center;
`;

const ListaOrcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroCliente, setFiltroCliente] = useState<string>('');
  // Substituir o filtroPeriodo por dois campos de data
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  // Definir o primeiro e último dia do mês atual ao carregar o componente
  useEffect(() => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setFiltroDataInicio(primeiroDiaMes.toISOString().split('T')[0]);
    setFiltroDataFim(ultimoDiaMes.toISOString().split('T')[0]);
  }, []);
  
  // Atualizar quando o componente for montado
  useEffect(() => {
    // Carregar dados quando o componente montar
    fetchData();
  }, []);
  
  // Criar um listener para mudanças de foco e visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(); // Carregar dados diretamente quando a página ficar visível
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Função fetchData separada para poder ser reutilizada
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Carregar clientes
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const clientesData = clientesSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          nome: doc.data()?.nome || ''
        }));
        setClientes(clientesData);

        // Carregar espécies para referência
        const especiesSnapshot = await getDocs(collection(db, 'especies'));
        const especiesData = especiesSnapshot.docs.map((doc: any) => ({
          id: doc.id,
          nome: doc.data()?.nome || ''
        }));
        
        // Carregar orçamentos
        const orcamentosQuery = query(collection(db, 'orcamentos'), orderBy('dataCriacao', 'desc'));
        const orcamentosSnapshot = await getDocs(orcamentosQuery);
        
        const orcamentosData = orcamentosSnapshot.docs.map((doc: any) => {
          const data = doc.data() || {};
          const cliente = clientesData.find((c: { id: string; nome: string }) => c.id === data.cliente);
          
          // Processar data de orçamento primeiro
          const dataOrcamento = processarDataOrcamento(data.dataOrcamento, doc.id);
          
          // Processar data de validade usando a data de orçamento como referência
          const dataValidade = processarDataValidade(data.dataValidade, dataOrcamento, doc.id);
          
          // Use o status do banco e só mude para vencido se for pendente e estiver vencido
          let status = data.status || 'pendente';
          
          // Normalizar o status para garantir consistência
          if (status === 'produção' || status === 'producao' || status === 'em produção' || status === 'em producao') {
            status = 'em_producao';
          } else if (status === 'finalizado' || status === 'concluído' || status === 'concluido') {
            status = 'finalizado';
          }
          
          // Verificar se está vencido apenas se estiver pendente
          if (status === 'pendente' && dataValidade < new Date()) {
            status = 'vencido';
          }
          
          // Verificação para casos de status em formato diferente (compatibilidade)
          if (status === 'produção' || status === 'producao' || status === 'em produção' || status === 'em producao') {
            status = 'em_producao';
          }
          
          // Adicionar detalhes de espécies aos itens
          const itens = data.itens?.map((item: any) => {
            const especie = especiesData.find((e: { id: string; nome: string }) => e.id === item.especie);
            return {
              ...item,
              especieNome: especie ? especie.nome : 'Espécie não encontrada'
            };
          }) || [];
          
          return {
            id: doc.id,
            numero: data.numero,
            cliente: data.cliente,
            clienteNome: cliente ? cliente.nome : 'Cliente não encontrado',
            dataOrcamento: dataOrcamento,
            dataValidade: dataValidade,
            valorTotal: data.valorTotal,
            formaPagamento: data.formaPagamento,
            prazoEntrega: data.prazoEntrega,
            observacoes: data.observacoes,
            itens,
            status
          };
        });
        
        setOrcamentos(orcamentosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
      } finally {
        setIsLoading(false);
      }
    };
    
  // Função auxiliar para processar a data do orçamento com tratamento de erros
  const processarDataOrcamento = (dataOriginal: any, orcamentoId: string): Date => {
    try {
      let dataProcessada: Date;
      
      if (dataOriginal && typeof dataOriginal.toDate === 'function') {
        // Se for um Timestamp do Firestore
        dataProcessada = dataOriginal.toDate();
      } else if (dataOriginal instanceof Date) {
        // Se já for um objeto Date
        dataProcessada = dataOriginal;
      } else if (dataOriginal && typeof dataOriginal === 'string') {
        // Se for uma string de data
        dataProcessada = new Date(dataOriginal);
      } else {
        // Fallback para a data atual
        dataProcessada = new Date();
        console.warn(`Formato de data de orçamento inválido para o orçamento ${orcamentoId}:`, dataOriginal);
      }
      
      // Verificação adicional para garantir que a data é válida
      if (isNaN(dataProcessada.getTime())) {
        console.warn(`Data de orçamento inválida para o orçamento ${orcamentoId}, usando data atual`);
        dataProcessada = new Date();
      }
      
      return dataProcessada;
    } catch (error) {
      console.error(`Erro ao processar data de orçamento ${orcamentoId}:`, error);
      return new Date();
    }
  };
  
  // Função auxiliar para processar a data de validade com tratamento de erros
  const processarDataValidade = (dataOriginal: any, dataOrcamento: Date, orcamentoId: string): Date => {
    try {
      let dataProcessada: Date;
      
      if (dataOriginal && typeof dataOriginal.toDate === 'function') {
        // Se for um Timestamp do Firestore
        dataProcessada = dataOriginal.toDate();
      } else if (dataOriginal instanceof Date) {
        // Se já for um objeto Date
        dataProcessada = dataOriginal;
      } else if (dataOriginal && typeof dataOriginal === 'string') {
        // Se for uma string de data
        dataProcessada = new Date(dataOriginal);
      } else {
        // Fallback para 30 dias após a data do orçamento
        dataProcessada = new Date(dataOrcamento);
        dataProcessada.setDate(dataProcessada.getDate() + 30);
        console.warn(`Formato de data de validade inválido para o orçamento ${orcamentoId}:`, dataOriginal);
      }
      
      // Verificação adicional para garantir que a data é válida
      if (isNaN(dataProcessada.getTime())) {
        console.warn(`Data de validade inválida para o orçamento ${orcamentoId}, usando 30 dias a partir da data do orçamento`);
        dataProcessada = new Date(dataOrcamento);
        dataProcessada.setDate(dataProcessada.getDate() + 30);
      }
      
      return dataProcessada;
    } catch (error) {
      console.error(`Erro ao processar data de validade ${orcamentoId}:`, error);
      const dataFallback = new Date(dataOrcamento);
      dataFallback.setDate(dataFallback.getDate() + 30);
      return dataFallback;
    }
  };
  
  // Formatar data para exibição com verificação de validade
  const formatarData = (data: Date | null | undefined): string => {
    if (!data) return 'Data não definida';
    
    // Verificar se a data é válida (não é NaN)
    if (isNaN(data.getTime())) return 'Data inválida';
    
    try {
    return data.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };
  
  // Atualizar a função de filtro para usar as datas de início e fim
  const orcamentosFiltrados = orcamentos.filter(orcamento => {
    // Filtro por status
    if (filtroStatus !== 'todos' && orcamento.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por cliente
    if (filtroCliente && orcamento.cliente !== filtroCliente) {
      return false;
    }
    
    // Filtro por período (data de início e fim)
    if (filtroDataInicio && filtroDataFim) {
      const dataInicio = new Date(filtroDataInicio);
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999); // Ajustar para o final do dia
      
      if (orcamento.dataOrcamento < dataInicio || orcamento.dataOrcamento > dataFim) {
        return false;
      }
    }
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      return (
        orcamento.numero.toLowerCase().includes(termo) ||
        (orcamento.clienteNome && orcamento.clienteNome.toLowerCase().includes(termo))
      );
    }
    
    return true;
  });
  
  // Paginação
  const totalPages = Math.ceil(orcamentosFiltrados.length / itemsPerPage);
  const paginatedOrcamentos = orcamentosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Gerar botões de paginação
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Botão Anterior
    buttons.push(
      <PageButton 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </PageButton>
    );
    
    // Primeira página
    if (currentPage > 3) {
      buttons.push(
        <PageButton 
          key={1} 
          onClick={() => handlePageChange(1)}
        >
          1
        </PageButton>
      );
      
      if (currentPage > 4) {
        buttons.push(<span key="ellipsis1">...</span>);
      }
    }
    
    // Páginas ao redor da atual
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      buttons.push(
        <PageButton 
          key={i} 
          $active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    // Última página
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        buttons.push(<span key="ellipsis2">...</span>);
      }
      
      buttons.push(
        <PageButton 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </PageButton>
      );
    }
    
    // Botão Próximo
    buttons.push(
      <PageButton 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </PageButton>
    );
    
    return buttons;
  };
  
  // Adicionar função para visualizar orçamento
  const visualizarOrcamento = (id: string) => {
    // Encontrar o orçamento pelo ID
    const orcamento = paginatedOrcamentos.find(orc => orc.id === id);
    if (orcamento) {
      // Criar um componente PrintOrcamentoButton temporário para exibir o relatório
      const printContainer = document.createElement('div');
      printContainer.style.display = 'none';
      document.body.appendChild(printContainer);

      // Renderizar o componente PrintOrcamentoButton
      const cleanup = () => {
        ReactDOM.unmountComponentAtNode(printContainer);
        document.body.removeChild(printContainer);
      };

      // Ajustar o status para compatibilidade
      const orcamentoAjustado = {
        ...orcamento,
        status: orcamento.status === 'em_producao' ? 'pendente' : orcamento.status
      } as const;

      // Criar um novo componente PrintOrcamentoButton
      const printComponent = (
        <PrintOrcamentoButton
          orcamento={orcamentoAjustado}
          buttonText=""
          onPrintRequest={() => {}}
        />
      );

      // Renderizar o componente
      ReactDOM.render(printComponent, printContainer);

      // Simular o clique no botão após a renderização
      setTimeout(() => {
        const button = printContainer.querySelector('button');
        if (button) {
          // Disparar o evento de impressão
          const event = new CustomEvent('print-orcamento', {
            detail: { printOption: 'COMPLETE' }
          });
          button.dispatchEvent(event);
        }
      }, 100);
    }
  };

  // Adicionar função para editar orçamento
  const editarOrcamento = (id: string) => {
    // Navegar para a página de edição
    navigate(`/orcamentos/editar/${id}`);
  };

  // Adicionar função para excluir orçamento
  const excluirOrcamento = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteDoc(doc(db, 'orcamentos', id));
        // Atualizar a lista após excluir
        fetchData();
        alert('Orçamento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        alert('Erro ao excluir orçamento. Verifique o console para mais detalhes.');
      }
    }
  };
  
  return (
    <Container>
      <PageHeader
        title="Lista de Orçamentos"
        description="Gerencie todos os orçamentos cadastrados, filtre por status, cliente ou período, e visualize detalhes."
      />

      <Header>
        <SectionTitle>Filtros</SectionTitle>
        <StyledLink to="/orcamentos/novo">
          <i className="fas fa-plus"></i> Novo Orçamento
        </StyledLink>
      </Header>
      
      <FiltersContainer>
        <FilterGroup>
          <Label htmlFor="filtroStatus">Status</Label>
          <Select 
            id="filtroStatus" 
            value={filtroStatus}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setFiltroStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="recusado">Recusados</option>
            <option value="vencido">Vencidos</option>
            <option value="em_producao">Produção</option>
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <Label htmlFor="filtroCliente">Cliente</Label>
          <Select 
            id="filtroCliente" 
            value={filtroCliente}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setFiltroCliente(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos os clientes</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <Label htmlFor="filtroDataInicio">Período - Início</Label>
          <Input 
            type="date" 
            id="filtroDataInicio" 
            value={filtroDataInicio}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFiltroDataInicio(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FilterGroup>
        
        <FilterGroup>
          <Label htmlFor="filtroDataFim">Período - Fim</Label>
          <Input 
            type="date" 
            id="filtroDataFim" 
            value={filtroDataFim}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFiltroDataFim(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FilterGroup>
        
        <FilterGroup>
          <Label htmlFor="termoBusca">Buscar</Label>
          <Input 
            type="text" 
            id="termoBusca" 
            placeholder="Número ou cliente..." 
            value={termoBusca}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setTermoBusca(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FilterGroup>
      </FiltersContainer>
      
      <Card>
        {isLoading ? (
          <EmptyState>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Carregando orçamentos...</p>
          </EmptyState>
        ) : paginatedOrcamentos.length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Validade</th>
                  <th>Valor Total</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrcamentos.map(orcamento => (
                  <tr key={orcamento.id}>
                    <td>{orcamento.numero}</td>
                    <td>{orcamento.clienteNome}</td>
                    <td>
                      {formatarData(orcamento.dataOrcamento) === 'Data inválida' || formatarData(orcamento.dataOrcamento) === 'Data não definida' ? (
                        <span style={{ color: '#dc3545', fontStyle: 'italic' }}>{formatarData(orcamento.dataOrcamento)}</span>
                      ) : (
                        formatarData(orcamento.dataOrcamento)
                      )}
                    </td>
                    <td>
                      {formatarData(orcamento.dataValidade) === 'Data inválida' || formatarData(orcamento.dataValidade) === 'Data não definida' ? (
                        <span style={{ color: '#dc3545', fontStyle: 'italic' }}>{formatarData(orcamento.dataValidade)}</span>
                      ) : (
                        formatarData(orcamento.dataValidade)
                      )}
                    </td>
                    <td>{formatarMoeda(orcamento.valorTotal)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge $status={orcamento.status}>
                        {orcamento.status === 'pendente' && (
                          <><i className="fas fa-clock"></i>Pendente</>
                        )}
                        {orcamento.status === 'aprovado' && (
                          <><i className="fas fa-check-circle"></i>Aprovado</>
                        )}
                        {orcamento.status === 'recusado' && (
                          <><i className="fas fa-times-circle"></i>Recusado</>
                        )}
                        {orcamento.status === 'vencido' && (
                          <><i className="fas fa-exclamation-circle"></i>Vencido</>
                        )}
                        {orcamento.status === 'em_producao' && (
                          <><i className="fas fa-cogs"></i>Produção</>
                        )}
                        {orcamento.status === 'finalizado' && (
                          <><i className="fas fa-check-circle"></i>Finalizado</>
                        )}
                      </StatusBadge>
                    </td>
                    <td>
                      <ActionButtonsContainer>
                        <PrintOrcamentoButton 
                          orcamento={{
                            ...orcamento,
                            status: orcamento.status === 'em_producao' ? 'pendente' : orcamento.status
                          } as const}
                          buttonText=""
                          onPrintRequest={() => {}}
                        />
                        <ActionButton 
                          title="Editar" 
                          onClick={() => editarOrcamento(orcamento.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </ActionButton>
                        <ActionButton 
                          title="Visualizar com Preços" 
                          onClick={() => visualizarOrcamento(orcamento.id)}
                        >
                          <i className="fas fa-eye"></i>
                        </ActionButton>
                        <ActionButton 
                          title="Excluir" 
                          onClick={() => excluirOrcamento(orcamento.id)}
                          style={{ color: '#dc3545' }} // Cor vermelha para indicar ação de exclusão
                        >
                          <i className="fas fa-trash-alt"></i>
                        </ActionButton>
                      </ActionButtonsContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        ) : (
          <EmptyState>
            <i className="fas fa-search"></i>
            <p>Nenhum orçamento encontrado com os filtros selecionados.</p>
          </EmptyState>
        )}
      </Card>
      
      {totalPages > 1 && (
        <Pagination>
          {renderPaginationButtons()}
        </Pagination>
      )}
    </Container>
  );
};

export default ListaOrcamentos; 