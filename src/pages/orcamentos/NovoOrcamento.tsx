import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import styled from 'styled-components';
import { collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc, Timestamp, DocumentData, QueryDocumentSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatarVolume, formatarMoeda } from '../../utils/madeira';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { ThemeType } from '../../styles/theme';
import Select from 'react-select';
import { useTheme } from '../../context/ThemeContext';

// Interfaces
interface Cliente {
  id: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

interface Especie {
  id: string;
  nome: string;
  descricao?: string;
}

interface ItemOrcamento {
  id: number;
  descricao: string;
  especie: string;
  quantidade: number | string;
  unidade: string;
  largura: number;
  altura: number;
  comprimento: number;
  valorUnitario: number;
  valorTotal: number;
  isQuantidade?: boolean;
  volumeCalculado?: number;
}

interface OrcamentoStatus {
  valor: string;
  label: string;
  cor: string;
}

// Styled Components
const Container = styled.div`
  padding: ${({ theme }: { theme: ThemeType }) => theme.spacing.large};
`;

const FormCard = styled.div`
  background-color: white;
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }: { theme: ThemeType }) => theme.shadows.medium};
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }: { theme: ThemeType }) => theme.spacing.small};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.small};
`;

const SelectStyled = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.small};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.small};
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    background-color: #ffffff;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.small};
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color ${({ theme }: { theme: ThemeType }) => theme.transitions.default};
  
  &:hover {
    background-color: #0b5ed7;
  }
  
  &:disabled {
    background-color: ${({ theme }: { theme: ThemeType }) => theme.colors.secondary};
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled(Button)`
  background-color: ${({ theme }: { theme: ThemeType }) => theme.colors.secondary};
  &:hover {
    background-color: #5a6268;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  }
  
  th {
    background-color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
    font-weight: 500;
    color: white;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  tr:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const TotalSection = styled.div`
  margin-top: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
  text-align: right;
`;

const TotalInfo = styled.div`
  margin-bottom: ${({ theme }: { theme: ThemeType }) => theme.spacing.small};
  font-weight: 500;
  font-size: ${({ theme }: { theme: ThemeType }) => theme.fontSizes.medium};

  strong {
    margin-left: ${({ theme }: { theme: ThemeType }) => theme.spacing.small};
    font-size: ${({ theme }: { theme: ThemeType }) => theme.fontSizes.large};
    color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
  margin-top: ${({ theme }: { theme: ThemeType }) => theme.spacing.medium};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.text};
  font-size: 16px;
`;

const ErrorText = styled.span`
  color: red;
  font-size: 0.8em;
  margin-top: 5px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  width: 90%;
  max-width: 600px;
  border-radius: ${({ theme }: { theme: ThemeType }) => theme.borderRadius.medium};
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }: { theme: ThemeType }) => theme.colors.border};
  padding-bottom: 10px;
  margin-bottom: 20px;
  cursor: move; /* Indicar que o cabeçalho é arrastável */
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
  font-weight: 500;
`;

const ModalBody = styled.div`
  max-height: calc(80vh - 120px);
  overflow-y: auto;
`;

const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover,
  &:focus {
    color: black;
    text-decoration: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: ${({ theme }: { theme: any }) => theme.spacing.small};
`;

const ToggleIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(0deg)' : 'rotate(180deg)'};
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
  font-size: 1.2rem;
`;

const NovoOrcamento: React.FC = () => {
  const { theme } = useTheme();
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [clientesOptions, setClientesOptions] = useState<{ value: string; label: string }[]>([]);
  const [especiesOptions, setEspeciesOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Garantir que o formData seja inicializado primeiro, antes de ser usado
  const [formData, setFormData] = useState({
    cliente: '',
    dataOrcamento: new Date().toISOString().split('T')[0],
    dataValidade: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    formaPagamento: '',
    prazoEntrega: '',
    observacoes: ''
  });
  
  const [dataOrcamento, setDataOrcamento] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState<string>('');
  const [numeroOrcamento, setNumeroOrcamento] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [prazoEntrega, setPrazoEntrega] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  
  // Novo item
  const [novoItem, setNovoItem] = useState<Omit<ItemOrcamento, 'id' | 'valorTotal'> & { isQuantidade?: boolean }>({
    descricao: '',
    especie: '',
    quantidade: '',
    unidade: 'm³',
    largura: 0,
    altura: 0,
    comprimento: 0,
    valorUnitario: 0,
    isQuantidade: false // Volume como padrão em vez de Quantidade/Dimensões
  });

  // Depois da declaração dos estados, adicionar o estado para o item em edição
  const [itemEmEdicao, setItemEmEdicao] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    valorUnitario: false,
    especie: false,
    quantidade: false
  });

  // Parâmetros da URL e navegação
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar o modo com base na URL
  const isEditMode = location.pathname.includes('/editar/');
  const isViewMode = location.pathname.includes('/visualizar/');
  const isNewMode = !isEditMode && !isViewMode;

  // Verificar se o ID é válido para modos de edição e visualização
  const isValidId = id && typeof id === 'string' && id.trim() !== '' && id !== 'undefined' && id !== 'null' && /^[a-zA-Z0-9-_]+$/.test(id);

  // Adicionar novos estados
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [modalEspecieAberto, setModalEspecieAberto] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Adicionar estados para os novos formulários
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  const [novaEspecie, setNovaEspecie] = useState({
    nome: '',
    descricao: ''
  });

  const [modalEditarClienteAberto, setModalEditarClienteAberto] = useState(false);
  const [modalEditarEspecieAberto, setModalEditarEspecieAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);
  const [especieEmEdicao, setEspecieEmEdicao] = useState<Especie | null>(null);
  
  // Depois da declaração dos estados, adicionar o estado para o status
  const [status, setStatus] = useState<string>('pendente');
  const [statusOptions] = useState<OrcamentoStatus[]>([
    { valor: 'pendente', label: 'Pendente', cor: '#FFA500' },
    { valor: 'aprovado', label: 'Aprovado', cor: '#28a745' },
    { valor: 'recusado', label: 'Recusado', cor: '#dc3545' },
    { valor: 'em_producao', label: 'Em Produção', cor: '#17a2b8' },
    { valor: 'finalizado', label: 'Finalizado', cor: '#6c757d' }
  ]);
  
  // Adicionar um state para controlar a visibilidade da seção de dados do orçamento
  const [mostrarDadosOrcamento, setMostrarDadosOrcamento] = useState<boolean>(true);
  
  // Carregar clientes e espécies
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const clientesData = clientesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nome: doc.data().nome,
          cpfCnpj: doc.data().cpfCnpj || '',
          telefone: doc.data().telefone || '',
          email: doc.data().email || '',
          endereco: doc.data().endereco || ''
        }));
        setClientes(clientesData);
        
        // Criar as opções para o react-select
        const options = clientesData.map(cliente => ({
          value: cliente.id,
          label: cliente.nome
        }));
        setClientesOptions(options);

        const especiesSnapshot = await getDocs(collection(db, 'especies'));
        const especiesData = especiesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nome: doc.data().nome,
          descricao: doc.data().descricao || ''
        }));
        setEspecies(especiesData);
        
        // Criar as opções para o react-select de espécies
        const especiesOptions = especiesData.map(especie => ({
          value: especie.id,
          label: especie.nome
        }));
        setEspeciesOptions(especiesOptions);
        
        // Define data de validade padrão (30 dias a partir de hoje)
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setDataValidade(date.toISOString().split('T')[0]);
        
        // Gera o número do orçamento baseado na data atual
        const now = new Date();
        const numeroPadrao = `ORC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        setNumeroOrcamento(numeroPadrao);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar clientes e espécies. Verifique o console para mais detalhes.');
      }
    };

    carregarDadosIniciais();
  }, []);

  // Carregar orçamento se estiver em modo de edição ou visualização
  useEffect(() => {
    if ((isEditMode || isViewMode) && clientesOptions.length > 0 && especiesOptions.length > 0) {
      // Se o ID não for válido, redirecionar para a lista
      if (!isValidId) {
        console.error('ID do orçamento inválido ou não fornecido:', id);
        navigate('/orcamentos/lista');
        return;
      }
      
      const carregarOrcamento = async () => {
        try {
          setLoading(true);
          
          // Log para depuração
          console.log('Tentando carregar orçamento com ID:', id);
          
          // Buscar o documento do orçamento pelo ID
          const orcamentoDoc = await getDoc(doc(db, 'orcamentos', id));
          
          if (orcamentoDoc.exists()) {
            const orcamentoData = orcamentoDoc.data();
            console.log("Dados do orçamento carregados:", orcamentoData);
            
            // Tratar diferentes formatos de data para dataOrcamento
            let dataOrcamento: Date;
            try {
              if (orcamentoData.dataOrcamento && typeof orcamentoData.dataOrcamento.toDate === 'function') {
                // Se for um Timestamp do Firestore
                dataOrcamento = orcamentoData.dataOrcamento.toDate();
              } else if (orcamentoData.dataOrcamento instanceof Date) {
                // Se já for um objeto Date
                dataOrcamento = orcamentoData.dataOrcamento;
              } else if (orcamentoData.dataOrcamento && typeof orcamentoData.dataOrcamento === 'string') {
                // Se for uma string de data
                dataOrcamento = new Date(orcamentoData.dataOrcamento);
              } else {
                // Fallback para a data atual se não puder ser determinada
                dataOrcamento = new Date();
                console.warn(`Formato de data inválido para dataOrcamento:`, orcamentoData.dataOrcamento);
              }
            } catch (error) {
              console.error(`Erro ao processar dataOrcamento:`, error);
              dataOrcamento = new Date();
            }
            
            // Tratar diferentes formatos de data para dataValidade
            let dataValidade: Date;
            try {
              if (orcamentoData.dataValidade && typeof orcamentoData.dataValidade.toDate === 'function') {
                // Se for um Timestamp do Firestore
                dataValidade = orcamentoData.dataValidade.toDate();
              } else if (orcamentoData.dataValidade instanceof Date) {
                // Se já for um objeto Date
                dataValidade = orcamentoData.dataValidade;
              } else if (orcamentoData.dataValidade && typeof orcamentoData.dataValidade === 'string') {
                // Se for uma string de data
                dataValidade = new Date(orcamentoData.dataValidade);
              } else {
                // Fallback para 30 dias a partir da data do orçamento
                dataValidade = new Date(dataOrcamento);
                dataValidade.setDate(dataValidade.getDate() + 30);
                console.warn(`Formato de data inválido para dataValidade:`, orcamentoData.dataValidade);
              }
            } catch (error) {
              console.error(`Erro ao processar dataValidade:`, error);
              dataValidade = new Date(dataOrcamento);
              dataValidade.setDate(dataValidade.getDate() + 30);
            }

            // Adicionar cliente se não existir nas opções
            if (orcamentoData.cliente && orcamentoData.clienteNome) {
              const clienteExistente = clientesOptions.find(opt => opt.value === orcamentoData.cliente);
              if (!clienteExistente) {
                console.log("Adicionando cliente às opções:", orcamentoData.clienteNome);
                setClientesOptions(prev => [...prev, { 
                  value: orcamentoData.cliente, 
                  label: orcamentoData.clienteNome 
                }]);
              }
            }
            
            // Verificar e adicionar espécies dos itens
            if (orcamentoData.itens && Array.isArray(orcamentoData.itens)) {
              for (const item of orcamentoData.itens) {
                if (item.especie && item.especieNome) {
                  const especieExistente = especiesOptions.find(opt => opt.value === item.especie);
                  if (!especieExistente) {
                    console.log("Adicionando espécie às opções:", item.especieNome);
                    setEspeciesOptions(prev => [...prev, { 
                      value: item.especie, 
                      label: item.especieNome 
                    }]);
                  }
                }
              }
            }
            
            // Atualizar o formulário
            console.log("Atualizando formData com:", {
              cliente: orcamentoData.cliente || '',
              dataOrcamento: dataOrcamento.toISOString().split('T')[0],
              dataValidade: dataValidade.toISOString().split('T')[0]
            });
            
            setFormData({
              cliente: orcamentoData.cliente || '',
              dataOrcamento: dataOrcamento.toISOString().split('T')[0],
              dataValidade: dataValidade.toISOString().split('T')[0],
              formaPagamento: orcamentoData.formaPagamento || '',
              prazoEntrega: orcamentoData.prazoEntrega || '',
              observacoes: orcamentoData.observacoes || ''
            });
            
            // Carregar o status do orçamento
            setStatus(orcamentoData.status || 'pendente');
            
            // Atualizar itens
            if (orcamentoData.itens && Array.isArray(orcamentoData.itens)) {
              console.log("Itens carregados:", orcamentoData.itens);
              setItens(orcamentoData.itens);
              
              // Se houver pelo menos um item, pré-carregar a espécie e valor unitário para novos itens
              if (orcamentoData.itens.length > 0) {
                const ultimoItem = orcamentoData.itens[orcamentoData.itens.length - 1];
                setNovoItem(prev => ({
                  ...prev,
                  especie: ultimoItem.especie || '',
                  valorUnitario: ultimoItem.valorUnitario || 0
                }));
              }
            }
            
            // Guardar número do orçamento
            setNumeroOrcamento(orcamentoData.numero || '');
          } else {
            alert('Orçamento não encontrado!');
            navigate('/orcamentos/lista');
          }
        } catch (error) {
          console.error('Erro ao carregar orçamento:', error);
          alert('Erro ao carregar dados do orçamento. Verifique o console para mais detalhes.');
        } finally {
          setLoading(false);
        }
      };
      
      carregarOrcamento();
    }
  }, [id, isEditMode, isViewMode, navigate, clientesOptions, especiesOptions, isValidId]);
  
  // useEffect para logging (só para debug)
  useEffect(() => {
    if ((isEditMode || isViewMode) && isValidId) {
      console.log("Estado atual do formData:", formData);
      console.log("Cliente selecionado:", formData.cliente);
      console.log("Opções de clientes disponíveis:", clientesOptions);
      console.log("Itens do orçamento:", itens);
    }
  }, [formData, clientesOptions, itens, isEditMode, isViewMode, isValidId]);

  // Modificar a função handleItemChange para também lidar com item em edição
  const handleItemChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratar valores de texto para conversão numérica quando necessário
    if (name === 'valorUnitario') {
      // Convertendo o valor para número (igual ao RomaneioTL)
      const numeroLimpo = value.replace(/[^\d]/g, '');
      const valorNumerico = numeroLimpo ? parseInt(numeroLimpo) / 100 : 0;
      
      setNovoItem(prev => ({
        ...prev,
        [name]: valorNumerico
      }));
      
      // Limpar erro
      setErrors(prev => ({ ...prev, valorUnitario: false }));
    } 
    else if (['altura', 'largura', 'comprimento'].includes(name)) {
      // Verificar se o valor é vazio (para permitir campo vazio)
      if (value === '') {
        setNovoItem(prev => ({
          ...prev,
          [name]: 0
        }));
        return;
      }
      
      // Converter valores de dimensões para números
      const valorLimpo = value.replace(',', '.');
      const numericValue = parseFloat(valorLimpo);
      
      console.log(`Atualizando ${name} para:`, numericValue);
      
      setNovoItem(prev => ({
        ...prev,
        [name]: isNaN(numericValue) ? 0 : numericValue
      }));
    }
    else if (name === 'quantidade') {
      // Adicionar validação para quantidade também
      if (value === '') {
        setNovoItem(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }
      
      // Converter para número, preservando casas decimais 
      const valorLimpo = value.toString().replace(',', '.');
      const numericValue = parseFloat(valorLimpo);
      
      setNovoItem(prev => ({
        ...prev,
        [name]: isNaN(numericValue) ? '' : numericValue
      }));
      
      // Limpar erro de quantidade, se existir
      setErrors(prev => ({ ...prev, quantidade: false }));
    }
    else if (name === 'especie') {
      setNovoItem(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Limpar erro
      setErrors(prev => ({ ...prev, especie: false }));
    }
    else {
      // Para outros campos, manter o comportamento padrão
      setNovoItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Formatar valores para exibição
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarVolume = (volume: number): string => {
    return volume.toFixed(2) + ' m³';
  };

  // Função para formatar o volume com 3 casas decimais e vírgula como separador decimal
  const formatarVolumeCustom = (volume: number): string => {
    // Garantir que o volume é um número válido
    if (isNaN(volume) || volume === undefined || volume === null) return '0,000 m³';
    
    // Formatar com 3 casas decimais e substituir ponto por vírgula
    // Sempre exibir o resultado em metros cúbicos (m³)
    return volume.toFixed(3).replace('.', ',') + ' m³';
  };

  // Modificar a função adicionarItem para suportar edição
  const handleAdicionarItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!novoItem.descricao || !novoItem.especie) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!novoItem.quantidade) {
      alert('Informe a quantidade/volume');
      return;
    }

    // Ajustar a unidade com base no tipo selecionado (volume ou quantidade)
    const unidadeAjustada = novoItem.isQuantidade ? 'pç' : 'm³';
    
    // Calcular volume - diferente com base no modo
    let volumeCalculado: number;
    const quantidade = typeof novoItem.quantidade === 'string' ? 
      parseFloat(novoItem.quantidade.replace(',', '.')) : 
      novoItem.quantidade;

    if (!isNaN(quantidade)) {
      // Se não estiver no modo quantidade (isQuantidade = false) e tiver dimensões, calcular cubagem
      if (!novoItem.isQuantidade && novoItem.altura > 0 && novoItem.largura > 0 && novoItem.comprimento > 0) {
        const altura = Number(novoItem.altura);
        const largura = Number(novoItem.largura);
        const comprimento = Number(novoItem.comprimento);

        // Fórmula: (altura × largura × comprimento × quantidade) / 1000000
        // A divisão por 1000000 converte cm³ para m³ (1 m³ = 1000000 cm³)
        volumeCalculado = (altura * largura * comprimento * quantidade) / 1000000;
        console.log(`MODO DIMENSÕES: (${altura} × ${largura} × ${comprimento} × ${quantidade}) / 1000000 = ${volumeCalculado} m³`);
      } else {
        // Se estiver no modo quantidade (isQuantidade = true) ou não tiver dimensões completas,
        // o volume é a própria quantidade
        volumeCalculado = quantidade;
        console.log(`MODO QUANTIDADE: volume = ${volumeCalculado} m³`);
      }
    } else {
      alert('Digite um valor válido para quantidade');
      return;
    }

    // Garantir que o volume calculado é um número válido com 3 casas decimais
    volumeCalculado = Number(volumeCalculado.toFixed(3));

    let valorTotal = volumeCalculado * novoItem.valorUnitario;
    
    if (itemEmEdicao !== null) {
      // Estamos no modo de edição, atualizar o item existente
      const novoItens = [...itens];
      novoItens[itemEmEdicao] = {
      ...novoItem,
        id: itens[itemEmEdicao].id,
        valorTotal: valorTotal,
        unidade: unidadeAjustada,
        isQuantidade: novoItem.isQuantidade,
        volumeCalculado: volumeCalculado
      } as ItemOrcamento;
      
      console.log('Item editado com volume:', novoItens[itemEmEdicao]);
      setItens(novoItens);
      setItemEmEdicao(null);
    } else {
      // Estamos adicionando um novo item
      const novoId = itens.length > 0 ? Math.max(...itens.map(item => item.id)) + 1 : 1;
      const novoItemCompleto: ItemOrcamento = {
        ...novoItem,
        id: novoId,
        valorTotal: valorTotal,
        unidade: unidadeAjustada,
        isQuantidade: novoItem.isQuantidade,
        volumeCalculado: volumeCalculado
      };
      
      console.log('Item adicionado com volume:', novoItemCompleto);
      setItens([...itens, novoItemCompleto]);
    }
    
    // Preservar os valores que queremos manter
    const especieSelecionada = novoItem.especie;
    const valorUnitarioSelecionado = novoItem.valorUnitario;
    const isQuantidadeSelecionado = novoItem.isQuantidade;
    const alturaSelecionada = novoItem.altura;
    const larguraSelecionada = novoItem.largura;
    const comprimentoSelecionado = novoItem.comprimento;
    const quantidadeSelecionada = novoItem.quantidade;
    const descricaoSelecionada = novoItem.descricao;
    
    // Resetar apenas a quantidade e descrição, mantendo os outros valores
    setNovoItem({
      descricao: descricaoSelecionada,
      especie: especieSelecionada,
      quantidade: quantidadeSelecionada,
      unidade: 'm³',
      largura: larguraSelecionada,
      altura: alturaSelecionada,
      comprimento: comprimentoSelecionado,
      valorUnitario: valorUnitarioSelecionado,
      isQuantidade: isQuantidadeSelecionado
    });

    // Focar no campo quantidade e selecionar seu conteúdo
    if (quantidadeRef.current) {
      setTimeout(() => {
        quantidadeRef.current?.focus();
        quantidadeRef.current?.select();
      }, 100);
    }
  };

  // Função para editar um item existente (carregar os dados para o formulário)
  const editarItem = (index: number) => {
    const itemParaEditar = itens[index];
    setItemEmEdicao(index);
    // Determinar se é quantidade baseado na unidade
    const isQuantidade = itemParaEditar.unidade !== 'm³';
    
    setNovoItem({
      descricao: itemParaEditar.descricao,
      especie: itemParaEditar.especie,
      quantidade: itemParaEditar.quantidade,
      unidade: itemParaEditar.unidade,
      largura: itemParaEditar.largura,
      altura: itemParaEditar.altura,
      comprimento: itemParaEditar.comprimento,
      valorUnitario: itemParaEditar.valorUnitario,
      isQuantidade: isQuantidade
    });
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const calcularTotal = (): number => {
    return itens.reduce((acc, item) => acc + item.valorTotal, 0);
  };

  // Função para limpar valores undefined e null recursivamente
  const limparObjeto = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          return limparObjeto(item);
        }
        return item;
      }).filter(item => item !== undefined);
    }
    
    if (typeof obj === 'object') {
      const resultado: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Pular campos com $ no início (props transientes do styled-components)
        if (key.startsWith('$')) continue;
        
        if (typeof value === 'object' && value !== null) {
          const limpo = limparObjeto(value);
          if (limpo !== undefined) {
            resultado[key] = limpo;
          }
        } else if (value !== undefined && value !== null) {
          resultado[key] = value;
        }
      }
      
      return Object.keys(resultado).length > 0 ? resultado : undefined;
    }
    
    return obj;
  };

  // Funções para manipulação do modal
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && modalRef.current) {
      const left = e.clientX - dragOffset.x;
      const top = e.clientY - dragOffset.y;
      
      modalRef.current.style.position = 'absolute';
      modalRef.current.style.margin = '0';
      modalRef.current.style.left = `${left}px`;
      modalRef.current.style.top = `${top}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Adicionar os event listeners depois das funções que serão usadas
  useEffect(() => {
    const modalAberto = modalClienteAberto || modalEspecieAberto || 
                       modalEditarClienteAberto || modalEditarEspecieAberto;
    
    if (modalAberto) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [modalClienteAberto, modalEspecieAberto, modalEditarClienteAberto, modalEditarEspecieAberto, isDragging, dragOffset]);

  // Funções para salvar novos registros
  const salvarNovoCliente = async () => {
    try {
      // Validar campos obrigatórios
      if (!novoCliente.nome.trim()) {
        alert('Nome do cliente é obrigatório.');
        return;
      }
      
      const docRef = await addDoc(collection(db, 'clientes'), {
        ...novoCliente,
        dataCriacao: Timestamp.now()
      });
      
      console.log('Cliente salvo com sucesso, ID:', docRef.id);
      
      // Atualizar lista de clientes com todos os campos
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        cpfCnpj: doc.data().cpfCnpj || '',
        telefone: doc.data().telefone || '',
        email: doc.data().email || '',
        endereco: doc.data().endereco || ''
      }));
      setClientes(clientesData);
      
      // Atualizar as opções do dropdown
      const options = clientesData.map(cliente => ({
        value: cliente.id,
        label: cliente.nome
      }));
      setClientesOptions(options);
      
      // Selecionar o novo cliente
      setFormData(prev => ({ ...prev, cliente: docRef.id }));
      
      // Fechar modal e resetar formulário
      setModalClienteAberto(false);
      setNovoCliente({
        nome: '',
        cpfCnpj: '',
        telefone: '',
        email: '',
        endereco: ''
      });
      
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const salvarNovaEspecie = async () => {
    try {
      if (!novaEspecie.nome.trim()) {
        alert('Nome da espécie é obrigatório.');
        return;
      }

      const docRef = await addDoc(collection(db, 'especies'), {
        ...novaEspecie,
        dataCriacao: Timestamp.now()
      });
      
      // Atualizar lista de espécies
      const especiesSnapshot = await getDocs(collection(db, 'especies'));
      const especiesData = especiesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        descricao: doc.data().descricao || ''
      }));
      setEspecies(especiesData);
      
      // Atualizar as opções do dropdown
      const especiesOptions = especiesData.map(especie => ({
        value: especie.id,
        label: especie.nome
      }));
      setEspeciesOptions(especiesOptions);
      
      // Selecionar a nova espécie no item atual
      setNovoItem(prev => ({ ...prev, especie: docRef.id }));
      
      // Fechar modal e resetar formulário
      setModalEspecieAberto(false);
      setNovaEspecie({
        nome: '',
        descricao: ''
      });

      alert('Espécie cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar espécie:', error);
      alert('Erro ao salvar espécie. Tente novamente.');
    }
  };

  // Adicionar função para atualizar o status
  const atualizarStatus = async (novoStatus: string) => {
    if (!id || !isEditMode) return;
    
    try {
      setLoading(true);
      
      await updateDoc(doc(db, 'orcamentos', id), {
        status: novoStatus,
        dataAtualizacao: Timestamp.now()
      });
      
      setStatus(novoStatus);
      alert(`Status atualizado para ${statusOptions.find(opt => opt.valor === novoStatus)?.label || novoStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Modificar a função de salvar para suportar edição
  const salvarOrcamento = async (e: FormEvent) => {
    e.preventDefault();
    // ... validation code

    try {
      setLoading(true);
      
      // Dados do orçamento - base para criação e atualização
      const orcamentoData: any = {
        cliente: formData.cliente,
        clienteNome: formData.cliente ? clientes.find(c => c.id === formData.cliente)?.nome || 'Cliente não encontrado' : 'Cliente não selecionado',
        dataOrcamento: Timestamp.fromDate(new Date(formData.dataOrcamento)),
        dataValidade: Timestamp.fromDate(new Date(formData.dataValidade)),
        dataAtualizacao: Timestamp.now(),
        formaPagamento: formData.formaPagamento || '',
        prazoEntrega: formData.prazoEntrega || '',
        observacoes: formData.observacoes || '',
        itens,
        valorTotal: calcularTotal(),
        status: status // Incluir o status
      };

      if (isEditMode && id) {
        // No modo de edição, precisamos recuperar o documento atual para preservar a dataCriacao
        try {
          const orcamentoDoc = await getDoc(doc(db, 'orcamentos', id));
          if (orcamentoDoc.exists()) {
            // Manter a dataCriacao original
            const orcamentoExistente = orcamentoDoc.data();
            if (orcamentoExistente.dataCriacao) {
              orcamentoData.dataCriacao = orcamentoExistente.dataCriacao;
            }
            if (orcamentoExistente.numero) {
              orcamentoData.numero = orcamentoExistente.numero;
            }
            if (orcamentoExistente.status) {
              orcamentoData.status = orcamentoExistente.status;
            }
          }
        } catch (error) {
          console.error('Erro ao recuperar orçamento existente:', error);
        }
        
        // Limpar o objeto orcamentoData
        const orcamentoDataLimpo = limparObjeto(orcamentoData);
        
        // Garantir que status está definido corretamente
        if ('status' in orcamentoData) {
          orcamentoDataLimpo.status = orcamentoData.status;
        }
        
        // Verificar se há itens no objeto e garantir que todos os itens têm valores válidos
        if (Array.isArray(orcamentoDataLimpo.itens)) {
          orcamentoDataLimpo.itens = orcamentoDataLimpo.itens.map(item => ({
            ...item,
            altura: item.altura || 0,
            largura: item.largura || 0,
            comprimento: item.comprimento || 0,
            quantidade: item.quantidade || 0,
            valorUnitario: item.valorUnitario || 0,
            valorTotal: item.valorTotal || 0
          }));
        }
        
        console.log('Dados para atualização:', orcamentoDataLimpo);
        
        try {
          // Agora atualize o documento com os dados corretos
          await updateDoc(doc(db, 'orcamentos', id), orcamentoDataLimpo);
        alert('Orçamento atualizado com sucesso!');
        } catch (updateError) {
          console.error('Erro específico ao atualizar documento:', updateError);
          if (updateError instanceof Error) {
            console.error('Detalhes do erro update:', updateError.message);
            throw new Error(`Erro ao atualizar: ${updateError.message}`);
          }
          throw updateError;
        }
      } else {
        // No modo de criação, adicionamos a data de criação e o número
        orcamentoData.dataCriacao = Timestamp.now();
        orcamentoData.numero = `ORC-${Date.now().toString().substring(7)}`;
        
        // Limpar o objeto orcamentoData para criação
        const orcamentoDataLimpo = limparObjeto(orcamentoData);
        
        // Garantir que status está definido corretamente
        if ('status' in orcamentoData) {
          orcamentoDataLimpo.status = orcamentoData.status;
        }
        
        // Verificar se há itens no objeto e garantir que todos os itens têm valores válidos
        if (Array.isArray(orcamentoDataLimpo.itens)) {
          orcamentoDataLimpo.itens = orcamentoDataLimpo.itens.map(item => ({
            ...item,
            altura: item.altura || 0,
            largura: item.largura || 0,
            comprimento: item.comprimento || 0,
            quantidade: item.quantidade || 0,
            valorUnitario: item.valorUnitario || 0,
            valorTotal: item.valorTotal || 0
          }));
        }
        
        console.log('Dados para criação:', orcamentoDataLimpo);
        
        try {
          await addDoc(collection(db, 'orcamentos'), orcamentoDataLimpo);
        alert('Orçamento salvo com sucesso!');
        } catch (createError) {
          console.error('Erro específico ao criar documento:', createError);
          if (createError instanceof Error) {
            console.error('Detalhes do erro create:', createError.message);
            throw new Error(`Erro ao criar: ${createError.message}`);
          }
          throw createError;
        }
      }
      
      // Redirecionar para a lista
      navigate('/orcamentos/lista');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      // Exibir mais detalhes sobre o erro
      if (error instanceof Error) {
        console.error('Mensagem de erro:', error.message);
        console.error('Stack trace:', error.stack);
        alert(`Erro ao salvar orçamento: ${error.message}`);
      } else if (error && typeof error === 'object') {
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        alert(`Erro ao salvar orçamento. Verifique o console para mais detalhes.`);
      } else {
        alert('Erro desconhecido ao salvar orçamento. Verifique o console para mais detalhes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar a função de edição de item
  const handleEditarItem = (index: number) => {
    const itemParaEditar = itens[index];
    setItemEmEdicao(index);
    // Determinar se é quantidade baseado na unidade
    const isQuantidade = itemParaEditar.unidade !== 'm³';
    
    setNovoItem({
      descricao: itemParaEditar.descricao,
      especie: itemParaEditar.especie,
      quantidade: itemParaEditar.quantidade,
      unidade: itemParaEditar.unidade,
      largura: itemParaEditar.largura,
      altura: itemParaEditar.altura,
      comprimento: itemParaEditar.comprimento,
      valorUnitario: itemParaEditar.valorUnitario,
      isQuantidade: isQuantidade
    });
  };

  // Implementar a tabela de itens completa
  const renderTabelaItens = () => {
    // Calcular o volume total dos itens usando diretamente o volumeCalculado de cada item
    const volumeTotal = itens.reduce((total, item) => {
      // Sempre usar o volumeCalculado armazenado
      return total + (item.volumeCalculado || 0);
    }, 0);
    
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Descrição</th>
              <th>Espécie</th>
              <th>Quantidade</th>
              <th>Dimensões</th>
              <th>Volume (m³)</th>
              <th>Valor Unit.</th>
              <th>Valor Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => {
              // Preparar string de dimensões conforme valores disponíveis
              // Garantir que as dimensões são números válidos
              const altura = isNaN(item.altura) ? 0 : item.altura;
              const largura = isNaN(item.largura) ? 0 : item.largura;
              const comprimento = isNaN(item.comprimento) ? 0 : item.comprimento;
              
              let dimensoesStr = '-';
              if (altura > 0) {
                if (largura > 0 && comprimento > 0) {
                  dimensoesStr = `${altura}×${largura}×${comprimento}`;
                } else if (largura > 0) {
                  dimensoesStr = `${altura}×${largura}`;
                } else {
                  dimensoesStr = `${altura}`;
                }
              }
              
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.descricao}</td>
                  <td>{especies.find(e => e.id === item.especie)?.nome || item.especie}</td>
                  <td>{!isNaN(item.quantidade) ? item.quantidade : '0'}</td>
                  <td>{dimensoesStr}</td>
                  <td>{formatarVolumeCustom(Number(item.volumeCalculado) || 0)}</td>
                  <td>{formatarMoeda(item.valorUnitario)}</td>
                  <td>{formatarMoeda(item.valorTotal)}</td>
                  <td>
                    {!isViewMode && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton type="button" onClick={() => editarItem(index)}>
                          <FaEdit />
                        </ActionButton>
                        <ActionButton type="button" onClick={() => removerItem(index)}>
                          <FaTrash />
                        </ActionButton>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Volume Total:</td>
              <td style={{ fontWeight: 'bold' }}>{formatarVolumeCustom(volumeTotal)}</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Valor Total:</td>
              <td style={{ fontWeight: 'bold' }}>{formatarMoeda(calcularTotal())}</td>
              <td></td>
            </tr>
          </tfoot>
        </Table>
      </TableContainer>
    );
  };

  // Funções para edição
  const handleEditarCliente = async () => {
    if (!clienteEmEdicao) return;

    try {
      const clienteRef = doc(db, 'clientes', clienteEmEdicao.id);
      await updateDoc(clienteRef, {
        nome: novoCliente.nome,
        cpfCnpj: novoCliente.cpfCnpj,
        telefone: novoCliente.telefone,
        email: novoCliente.email,
        endereco: novoCliente.endereco,
        dataAtualizacao: Timestamp.now()
      });

      // Atualizar lista de clientes
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        cpfCnpj: doc.data().cpfCnpj,
        telefone: doc.data().telefone,
        email: doc.data().email,
        endereco: doc.data().endereco
      }));
      setClientes(clientesData);

      // Atualizar as opções do dropdown
      const options = clientesData.map(cliente => ({
        value: cliente.id,
        label: cliente.nome
      }));
      setClientesOptions(options);

      // Se o cliente editado é o cliente atual do orçamento, atualizar o formData
      if (formData.cliente === clienteEmEdicao.id) {
        setFormData(prev => ({ ...prev, cliente: clienteEmEdicao.id }));
      }

      setModalEditarClienteAberto(false);
      setClienteEmEdicao(null);
      setNovoCliente({
        nome: '',
        cpfCnpj: '',
        telefone: '',
        email: '',
        endereco: ''
      });

      alert('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      alert('Erro ao editar cliente. Tente novamente.');
    }
  };

  const handleEditarEspecie = async () => {
    if (!especieEmEdicao) return;

    try {
      const especieRef = doc(db, 'especies', especieEmEdicao.id);
      await updateDoc(especieRef, {
        nome: novaEspecie.nome,
        descricao: novaEspecie.descricao,
        dataAtualizacao: Timestamp.now()
      });

      // Atualizar lista de espécies
      const especiesSnapshot = await getDocs(collection(db, 'especies'));
      const especiesData = especiesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        descricao: doc.data().descricao
      }));
      setEspecies(especiesData);

      // Atualizar as opções do dropdown
      const especiesOptions = especiesData.map(especie => ({
        value: especie.id,
        label: especie.nome
      }));
      setEspeciesOptions(especiesOptions);

      // Se a espécie editada é a espécie atual do item, atualizar o novoItem
      if (novoItem.especie === especieEmEdicao.id) {
        setNovoItem(prev => ({ ...prev, especie: especieEmEdicao.id }));
      }

      // Atualizar os itens da lista que usam esta espécie
      const itensAtualizados = itens.map(item => {
        if (item.especie === especieEmEdicao.id) {
          return { ...item };
        }
        return item;
      });
      setItens(itensAtualizados);

      setModalEditarEspecieAberto(false);
      setEspecieEmEdicao(null);
      setNovaEspecie({
        nome: '',
        descricao: ''
      });

      alert('Espécie atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar espécie:', error);
      alert('Erro ao editar espécie. Tente novamente.');
    }
  };

  const abrirModalEditarCliente = (cliente: Cliente) => {
    setClienteEmEdicao(cliente);
    setNovoCliente({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      endereco: cliente.endereco || ''
    });
    setModalEditarClienteAberto(true);
  };

  const abrirModalEditarEspecie = (especie: Especie) => {
    setEspecieEmEdicao(especie);
    setNovaEspecie({
      nome: especie.nome,
      descricao: especie.descricao || ''
    });
    setModalEditarEspecieAberto(true);
  };

  // Adicionar função de excluir cliente
  const handleExcluirCliente = async () => {
    if (!clienteEmEdicao || !clienteEmEdicao.id) {
      alert('Cliente não encontrado.');
      return;
    }

    // Confirmar exclusão
    const confirmar = window.confirm(`Tem certeza que deseja excluir o cliente "${clienteEmEdicao.nome}"?`);
    if (!confirmar) return;

    try {
      setLoading(true);
      
      // Verificar se o cliente está sendo usado em algum orçamento
      const orcamentosQuery = query(
        collection(db, 'orcamentos'),
        where('cliente', '==', clienteEmEdicao.id)
      );
      
      const orcamentosSnapshot = await getDocs(orcamentosQuery);
      
      if (!orcamentosSnapshot.empty) {
        alert('Este cliente não pode ser excluído pois está associado a um ou mais orçamentos.');
        setLoading(false);
        return;
      }
      
      // Excluir o cliente
      await deleteDoc(doc(db, 'clientes', clienteEmEdicao.id));
      
      // Atualizar lista de clientes
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        cpfCnpj: doc.data().cpfCnpj || '',
        telefone: doc.data().telefone || '',
        email: doc.data().email || '',
        endereco: doc.data().endereco || ''
      }));
      setClientes(clientesData);
      
      // Atualizar as opções do dropdown
      const options = clientesData.map(cliente => ({
        value: cliente.id,
        label: cliente.nome
      }));
      setClientesOptions(options);
      
      // Se o cliente atual foi excluído, limpar a seleção
      if (formData.cliente === clienteEmEdicao.id) {
        setFormData(prev => ({ ...prev, cliente: '' }));
      }
      
      // Fechar modal
      setModalEditarClienteAberto(false);
      alert('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar função para excluir espécie
  const handleExcluirEspecie = async () => {
    if (!especieEmEdicao || !especieEmEdicao.id) {
      alert('Espécie não encontrada.');
      return;
    }

    // Confirmar exclusão
    const confirmar = window.confirm(`Tem certeza que deseja excluir a espécie "${especieEmEdicao.nome}"?`);
    if (!confirmar) return;

    try {
      setLoading(true);
      
      // Verificar se a espécie está sendo usada em algum orçamento
      const orcamentosQuery = query(
        collection(db, 'orcamentos'),
        where('itens', 'array-contains', { especie: especieEmEdicao.id })
      );
      
      // Alternativa para verificar todos os orçamentos
      const todosOrcamentosQuery = query(collection(db, 'orcamentos'));
      const orcamentosSnapshot = await getDocs(todosOrcamentosQuery);
      
      // Verificar se a espécie está sendo usada em algum item de orçamento
      let especieEmUso = false;
      orcamentosSnapshot.forEach((docSnap) => {
        const orcamento = docSnap.data();
        if (orcamento.itens && Array.isArray(orcamento.itens)) {
          const itemComEspecie = orcamento.itens.find((item: any) => item.especie === especieEmEdicao.id);
          if (itemComEspecie) {
            especieEmUso = true;
          }
        }
      });
      
      if (especieEmUso) {
        alert('Esta espécie não pode ser excluída pois está associada a um ou mais orçamentos.');
        setLoading(false);
        return;
      }
      
      // Excluir a espécie
      await deleteDoc(doc(db, 'especies', especieEmEdicao.id));
      
      // Atualizar lista de espécies
      const especiesSnapshot = await getDocs(collection(db, 'especies'));
      const especiesData = especiesSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        descricao: doc.data().descricao || ''
      }));
      setEspecies(especiesData);
      
      // Atualizar as opções do dropdown
      const especiesOptions = especiesData.map(especie => ({
        value: especie.id,
        label: especie.nome
      }));
      setEspeciesOptions(especiesOptions);
      
      // Se a espécie atual foi excluída, limpar a seleção
      if (novoItem.especie === especieEmEdicao.id) {
        setNovoItem(prev => ({ ...prev, especie: '' }));
      }
      
      // Fechar modal
      setModalEditarEspecieAberto(false);
      alert('Espécie excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir espécie:', error);
      alert('Erro ao excluir espécie. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Estilo para os botões de ação
  const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    gap: 10px;
  `;

  const DeleteButton = styled(Button)`
    background-color: ${({ theme }: { theme: any }) => theme.colors.danger};
    
    &:hover {
      background-color: #c82333;
    }
  `;

  // Adicionar refs para os campos
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const alturaRef = useRef<HTMLInputElement>(null);
  const larguraRef = useRef<HTMLInputElement>(null);
  const comprimentoRef = useRef<HTMLInputElement>(null);
  const valorUnitarioRef = useRef<HTMLInputElement>(null);
  const adicionarItemRef = useRef<HTMLButtonElement>(null);

  // Função para selecionar todo o conteúdo de um input
  const selecionarConteudo = (input: HTMLInputElement) => {
    input.select();
  };

  // Função para lidar com a tecla Enter
  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>, nextRef: React.RefObject<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef.current) {
        nextRef.current.focus();
        if (nextRef.current instanceof HTMLInputElement) {
          selecionarConteudo(nextRef.current);
        } else {
          // Se for o botão de adicionar, clicar nele
          nextRef.current.click();
        }
      }
    }
  };

  return (
    <Container>
      <PageHeader
        title={
          isNewMode ? 'Novo Orçamento' : 
          isEditMode ? 'Editar Orçamento' : 
          'Visualizar Orçamento' + (numeroOrcamento ? ` - ${numeroOrcamento}` : '')
        }
        description={
          isNewMode ? 'Crie um novo orçamento para seus clientes com itens, valores e condições de pagamento.' :
          isEditMode ? 'Modifique os dados do orçamento existente conforme necessário.' :
          'Visualize os detalhes do orçamento e as informações dos itens.'
        }
      />

      {isEditMode && (
      <FormCard>
          <SectionTitle>Status do Orçamento</SectionTitle>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {statusOptions.map((opcao) => (
              <Button
                key={opcao.valor}
                type="button"
                onClick={() => atualizarStatus(opcao.valor)}
                style={{ 
                  backgroundColor: opcao.valor === status ? opcao.cor : '#f8f9fa',
                  color: opcao.valor === status ? 'white' : '#333',
                  border: `1px solid ${opcao.cor}`,
                  fontWeight: opcao.valor === status ? 'bold' : 'normal',
                  padding: '8px 15px',
                  minWidth: '120px'
                }}
              >
                {opcao.label}
              </Button>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Status atual: <strong style={{ 
              color: statusOptions.find(opt => opt.valor === status)?.cor 
            }}>
              {statusOptions.find(opt => opt.valor === status)?.label || 'Pendente'}
            </strong>
          </div>
        </FormCard>
      )}

      <FormCard>
        <SectionHeader onClick={() => setMostrarDadosOrcamento(!mostrarDadosOrcamento)}>
          <SectionTitle>Dados do Orçamento</SectionTitle>
          <ToggleIcon $isOpen={mostrarDadosOrcamento}>
            <i className="fas fa-chevron-down"></i>
          </ToggleIcon>
        </SectionHeader>
        
        {mostrarDadosOrcamento && (
        <Form onSubmit={salvarOrcamento}>
          <FormGroup>
            <Label htmlFor="cliente">Cliente</Label>
              <InputGroup>
            <Select 
              id="cliente" 
                  value={clientesOptions.find(option => option.value === formData.cliente) || null}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setFormData({...formData, cliente: selectedOption.value});
                    } else {
                      setFormData({...formData, cliente: ''});
                    }
                  }}
                  options={clientesOptions}
                  placeholder="Selecione ou digite para buscar"
                  isClearable
              required
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: '100%',
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      '&:hover': {
                        borderColor: '#80bdff',
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
                <AddButton type="button" onClick={() => setModalClienteAberto(true)}>
                  <FaPlus />
                </AddButton>
                {formData.cliente && (
                  <AddButton 
                    type="button" 
                    onClick={() => {
                      const clienteSelecionado = clientes.find(c => c.id === formData.cliente);
                      if (clienteSelecionado) {
                        abrirModalEditarCliente(clienteSelecionado);
                      }
                    }}
                  >
                    <FaEdit />
                  </AddButton>
                )}
              </InputGroup>
          </FormGroup>
          
            {/* Campos alinhados horizontalmente em uma única linha */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <FormGroup>
                <Label htmlFor="dataValidade">Validade</Label>
            <Input 
              type="date" 
                  id="dataValidade" 
                  value={formData.dataValidade}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dataValidade: e.target.value })}
              required
            />
          </FormGroup>
          
            <FormGroup>
                <Label htmlFor="dataOrcamento">Data do Orçamento</Label>
              <Input 
                type="date" 
                  id="dataOrcamento" 
                  value={formData.dataOrcamento}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dataOrcamento: e.target.value })}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Input 
                type="text" 
                id="formaPagamento" 
                value={formData.formaPagamento}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, formaPagamento: e.target.value })}
                placeholder="Ex: A Prazo, A Vista, etc"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="prazoEntrega">Prazo de Entrega</Label>
              <Input 
                type="text" 
                id="prazoEntrega" 
                value={formData.prazoEntrega}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prazoEntrega: e.target.value })}
                placeholder="Ex: 10 dias úteis após aprovação"
              />
            </FormGroup>
          </div>
        </Form>
        )}
      </FormCard>
      
      <FormCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>{itemEmEdicao !== null ? 'Editar Item' : 'Adicionar Item'}</SectionTitle>
        </div>
        
        <Form id="form-adicionar-item" onSubmit={handleAdicionarItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {/* Campo Espécie com tamanho aumentado */}
          <FormGroup style={{ flex: '0 0 25%' }}>
            <Label htmlFor="especie">Espécie</Label>
            <InputGroup>
            <Select 
              id="especie" 
                value={especiesOptions.find(option => option.value === novoItem.especie) || null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    handleItemChange({
                      target: {
                        name: 'especie',
                        value: selectedOption.value
                      }
                    } as React.ChangeEvent<HTMLSelectElement>);
                  } else {
                    handleItemChange({
                      target: {
                        name: 'especie',
                        value: ''
                      }
                    } as React.ChangeEvent<HTMLSelectElement>);
                  }
                }}
                options={especiesOptions}
                placeholder="Selecione uma espécie"
                isClearable
              required
                className={errors && errors.especie ? 'error' : ''}
                styles={{
                  control: (base) => ({
                    ...base,
                    width: '100%',
                    minHeight: '38px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    '&:hover': {
                      borderColor: '#80bdff',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
              <AddButton type="button" onClick={() => setModalEspecieAberto(true)}>
                <FaPlus />
              </AddButton>
              {novoItem.especie && (
                <AddButton 
                  type="button" 
                  onClick={() => {
                    const especieSelecionada = especies.find(e => e.id === novoItem.especie);
                    if (especieSelecionada) {
                      abrirModalEditarEspecie(especieSelecionada);
                    }
                  }}
                >
                  <FaEdit />
                </AddButton>
              )}
            </InputGroup>
            {errors && errors.especie && <ErrorText>Selecione uma espécie</ErrorText>}
          </FormGroup>
          
          {/* Reorganização dos campos em um container flexível */}
          <div style={{ flex: '1', display: 'flex', gap: '12px' }}>
            {/* Checkboxes para Volume/Quantidade */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', marginTop: '24px' }}>
              <div style={{ marginBottom: '5px' }}>
                <input 
                  type="radio" 
                  id="radioVolume" 
                  name="tipoMedida" 
                  value="volume" 
                  checked={!novoItem.isQuantidade} 
                  onChange={() => {
                    setNovoItem({
                      ...novoItem,
                      isQuantidade: false
                    });
                  }}
                />
                <label htmlFor="radioVolume" style={{ marginLeft: '5px' }}>Quantidade</label>
              </div>
              <div>
                <input 
                  type="radio" 
                  id="radioQuantidade" 
                  name="tipoMedida" 
                  value="quantidade" 
                  checked={novoItem.isQuantidade} 
                  onChange={() => {
                    setNovoItem({
                      ...novoItem,
                      isQuantidade: true
                    });
                  }}
                />
                <label htmlFor="radioQuantidade" style={{ marginLeft: '5px' }}>Dimensões</label>
              </div>
            </div>
            
            {/* Campo Volume ou Quantidade (agora Dimensões) */}
            <FormGroup style={{ 
              width: novoItem.isQuantidade ? 'calc(100% - 100px)' : '150px',
              transition: 'width 0.3s ease-in-out'
            }}>
              <Label htmlFor="quantidade">{novoItem.isQuantidade ? 'Dimensões (pç)' : 'Quantidade'}</Label>
            <Input 
                ref={quantidadeRef}
              type="text" 
              id="quantidade" 
              name="quantidade" 
                value={novoItem.quantidade || ''}
                onChange={(e) => {
                  const valor = e.target.value.replace(',', '.');
                  if (valor === '' || !isNaN(parseFloat(valor))) {
                    handleItemChange({
                      target: {
                        name: 'quantidade',
                        value: valor
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                onFocus={(e) => selecionarConteudo(e.target)}
                onKeyDown={(e) => handleEnterKey(e, alturaRef)}
              required
                placeholder={novoItem.isQuantidade ? "Insira as Dimensões" : "Quant. de Peças"}
            />
          </FormGroup>
          
            {/* Container para campos de dimensão - sempre incluídos no DOM, visibilidade controlada por CSS */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flex: '1', 
              visibility: !novoItem.isQuantidade ? 'visible' : 'hidden',
              opacity: !novoItem.isQuantidade ? '1' : '0',
              maxWidth: !novoItem.isQuantidade ? '100%' : '0',
              overflow: 'hidden',
              transition: 'opacity 0.3s, max-width 0.3s',
              position: 'relative',
              marginTop: '0'
            }}>
              {/* Campos de dimensões */}
              <FormGroup style={{ flex: '1' }}>
                <Label htmlFor="altura">Espessura (cm)</Label>
                <Input 
                  ref={alturaRef}
                  type="number" 
                  id="altura" 
                  name="altura" 
                  value={novoItem.altura || ''}
                  onChange={handleItemChange}
                  onFocus={(e) => selecionarConteudo(e.target)}
                  onKeyDown={(e) => handleEnterKey(e, larguraRef)}
                  step="0.1"
                  min="0"
                  required={!novoItem.isQuantidade}
                  disabled={novoItem.isQuantidade}
                />
              </FormGroup>
              
              <FormGroup style={{ flex: '1' }}>
                <Label htmlFor="largura">Largura (cm)</Label>
                <Input 
                  ref={larguraRef}
                  type="number" 
                  id="largura" 
                  name="largura" 
                  value={novoItem.largura || ''}
                  onChange={handleItemChange}
                  onFocus={(e) => selecionarConteudo(e.target)}
                  onKeyDown={(e) => handleEnterKey(e, comprimentoRef)}
                  step="0.1"
                  min="0"
                  disabled={novoItem.isQuantidade}
                />
              </FormGroup>
              
              <FormGroup style={{ flex: '1' }}>
                <Label htmlFor="comprimento">Comprimento (cm)</Label>
                <Input 
                  ref={comprimentoRef}
                  type="number" 
                  id="comprimento" 
                  name="comprimento" 
                  value={novoItem.comprimento || ''}
                  onChange={handleItemChange}
                  onFocus={(e) => selecionarConteudo(e.target)}
                  onKeyDown={(e) => handleEnterKey(e, valorUnitarioRef)}
                  step="0.1"
                  min="0"
                  disabled={novoItem.isQuantidade}
                />
              </FormGroup>
            </div>
          </div>
          
          {/* Ajustando campos de Preço e Observações na mesma linha */}
          <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
            {/* Campo Preço por m³ com tamanho fixo */}
            <FormGroup style={{ width: '150px', flexShrink: 0 }}>
              <Label htmlFor="valorUnitario">Preço por m³:</Label>
            <Input 
                ref={valorUnitarioRef}
              type="text" 
                id="valorUnitario" 
                name="valorUnitario" 
                value={novoItem.valorUnitario ? formatarMoeda(novoItem.valorUnitario) : ''}
              onChange={handleItemChange}
                onFocus={(e) => selecionarConteudo(e.target)}
                onKeyDown={(e) => handleEnterKey(e, adicionarItemRef)}
              required
                className={errors && errors.valorUnitario ? 'error' : ''}
                style={{ textAlign: 'right' }}
            />
              {errors && errors.valorUnitario && <ErrorText>Digite um valor válido</ErrorText>}
          </FormGroup>
          
            {/* Campo Observações ocupando o espaço restante */}
            <FormGroup style={{ flex: '1' }}>
              <Label htmlFor="descricao">Observações</Label>
            <Input 
              type="text" 
                id="descricao" 
                name="descricao" 
                value={novoItem.descricao}
              onChange={handleItemChange}
                placeholder="Ex: Forçar madeira de 3m acima de Comprimento"
            />
          </FormGroup>
          </div>
          
          <FormGroup style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', width: '100%' }}>
            <ButtonSecondary 
              ref={adicionarItemRef}
              type="submit" 
              style={{ width: '150px' }}
              onClick={() => {
                // Após adicionar o item, focar no campo quantidade
                if (quantidadeRef.current) {
                  setTimeout(() => {
                    quantidadeRef.current?.focus();
                    quantidadeRef.current?.select();
                  }, 100);
                }
              }}
            >
              {itemEmEdicao !== null ? 'Atualizar Item' : 'Adicionar Item'}
            </ButtonSecondary>
            
            {!isViewMode && (
              <Button 
                type="button" 
                onClick={(e) => salvarOrcamento(e)}
                disabled={loading}
                style={{ width: '150px' }}
              >
                {loading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Salvar'}
              </Button>
            )}
            
            <Button 
              type="button" 
              onClick={() => navigate('/orcamentos/lista')}
              style={{ marginLeft: 'auto', width: '150px' }}
            >
              Voltar
            </Button>
          </FormGroup>
        </Form>
      </FormCard>
      
      {/* No botão "Cancelar Edição" quando estiver em modo de edição */}
      {itemEmEdicao !== null && (
        <Button 
                          type="button" 
          style={{ marginTop: '10px', backgroundColor: '#6c757d', width: '150px' }}
          onClick={() => {
            // Guardar os valores que queremos preservar
            const especieSelecionada = novoItem.especie;
            const valorUnitarioSelecionado = novoItem.valorUnitario;
            const isQuantidadeSelecionado = novoItem.isQuantidade;
            
            setItemEmEdicao(null);
            setNovoItem({
              descricao: '',
              especie: especieSelecionada, // Preservar a espécie
              quantidade: '',
              unidade: 'm³',
              largura: 0,
              altura: 0,
              comprimento: 0,
              valorUnitario: valorUnitarioSelecionado, // Preservar o valor unitário
              isQuantidade: isQuantidadeSelecionado // Preservar a opção de quantidade/volume
            });
          }}
        >
          Cancelar Edição
        </Button>
      )}
      
      {itens.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <SectionTitle>Itens do Orçamento</SectionTitle>
          {renderTabelaItens()}
        </div>
      )}

      {/* Modal para cadastro de cliente */}
      {modalClienteAberto && (
        <Modal>
          <ModalContent>
            <ModalHeader onMouseDown={handleMouseDown}>
              <ModalTitle>Novo Cliente</ModalTitle>
              <CloseButton onClick={() => setModalClienteAberto(false)}>
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
          <FormGroup>
                <Label htmlFor="nomeCliente">Nome</Label>
                <Input 
                  type="text" 
                  id="nomeCliente" 
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input 
                  type="text" 
                  id="cpfCnpj" 
                  value={novoCliente.cpfCnpj}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cpfCnpj: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  type="text" 
                  id="telefone" 
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="endereco">Endereço</Label>
            <TextArea 
                  id="endereco" 
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
            />
          </FormGroup>
              <Button onClick={salvarNovoCliente}>Salvar</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para cadastro de espécie */}
      {modalEspecieAberto && (
        <Modal>
          <ModalContent>
            <ModalHeader onMouseDown={handleMouseDown}>
              <ModalTitle>Nova Espécie</ModalTitle>
              <CloseButton onClick={() => setModalEspecieAberto(false)}>
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="nomeEspecie">Nome</Label>
                <Input 
                  type="text" 
                  id="nomeEspecie" 
                  value={novaEspecie.nome}
                  onChange={(e) => setNovaEspecie({ ...novaEspecie, nome: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="descricaoEspecie">Descrição</Label>
                <TextArea 
                  id="descricaoEspecie" 
                  value={novaEspecie.descricao}
                  onChange={(e) => setNovaEspecie({ ...novaEspecie, descricao: e.target.value })}
                />
              </FormGroup>
              <Button onClick={salvarNovaEspecie}>Salvar</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para edição de cliente */}
      {modalEditarClienteAberto && (
        <Modal>
          <ModalContent>
            <ModalHeader onMouseDown={handleMouseDown}>
              <ModalTitle>Editar Cliente</ModalTitle>
              <CloseButton onClick={() => setModalEditarClienteAberto(false)}>
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="nomeCliente">Nome</Label>
                <Input 
                  type="text" 
                  id="nomeCliente" 
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input 
                  type="text" 
                  id="cpfCnpj" 
                  value={novoCliente.cpfCnpj}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cpfCnpj: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  type="text" 
                  id="telefone" 
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="endereco">Endereço</Label>
                <TextArea 
                  id="endereco" 
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                />
              </FormGroup>
              <ButtonContainer>
                <Button onClick={handleEditarCliente} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <DeleteButton onClick={handleExcluirCliente} disabled={loading}>
                  {loading ? 'Processando...' : 'Excluir Cliente'}
                </DeleteButton>
              </ButtonContainer>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal para edição de espécie */}
      {modalEditarEspecieAberto && (
        <Modal>
          <ModalContent>
            <ModalHeader onMouseDown={handleMouseDown}>
              <ModalTitle>Editar Espécie</ModalTitle>
              <CloseButton onClick={() => setModalEditarEspecieAberto(false)}>
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="nomeEspecie">Nome</Label>
                <Input 
                  type="text" 
                  id="nomeEspecie" 
                  value={novaEspecie.nome}
                  onChange={(e) => setNovaEspecie({ ...novaEspecie, nome: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="descricaoEspecie">Descrição</Label>
                <TextArea 
                  id="descricaoEspecie" 
                  value={novaEspecie.descricao}
                  onChange={(e) => setNovaEspecie({ ...novaEspecie, descricao: e.target.value })}
                />
              </FormGroup>
              <ButtonContainer>
                <Button onClick={handleEditarEspecie} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <DeleteButton onClick={handleExcluirEspecie} disabled={loading}>
                  {loading ? 'Processando...' : 'Excluir Espécie'}
                </DeleteButton>
              </ButtonContainer>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default NovoOrcamento; 