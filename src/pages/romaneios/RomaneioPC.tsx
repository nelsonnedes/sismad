import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaList, FaSave, FaPrint } from 'react-icons/fa';
import { formatarMedida } from '../../utils/formatacao';
import { formatarMoeda, calcularVolumePacote, formatarVolume } from '../../utils/madeira';
import { clientesService, especiesService, romaneiosService, Cliente, Especie } from '../../services/firebaseService';
import { ThemeType } from '../../styles/theme';
import PrintRomaneioButton from '../../components/romaneios/PrintRomaneioButton';
import { Romaneio } from '../../components/romaneios/PrintRomaneio';
import PageHeader from '../../components/PageHeader';

// Interfaces
interface PacoteItem {
  id: number;
  espessura: number;
  largura: number;
  comprimento: number;
  pecasPorPacote: number;
  quantidade: number; // Equivalente a "pacotes" no HTML original
  especieId?: string; // ID da espécie específica para este item (opcional)
  especieNome?: string; // Nome da espécie específica para este item
  volume: number;
  valorUnitario: number;
  valorTotal: number;
}

interface RomaneioForm {
  cliente: string;
  clienteNome?: string;
  data: string;
  valorUnitario: number;
  itens: PacoteItem[];
}

interface StyledProps {
  theme: ThemeType;
}

interface SectionContentProps {
  $isVisible: boolean;
}

interface ToggleIconProps {
  $isVisible: boolean;
}

// Componentes estilizados
const Container = styled.div`
  padding: ${({ theme }: StyledProps) => theme.spacing.large};
`;

const FormContainer = styled.form`
  background-color: #ffffff;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: ${(props: StyledProps) => props.theme.spacing.large};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.large};
`;

const FormSection = styled.div`
  background-color: ${({ theme }: StyledProps) => theme.colors.cardBackground};
  border-radius: ${({ theme }: StyledProps) => theme.borderRadius.medium};
  box-shadow: ${({ theme }: StyledProps) => theme.shadows.small};
  padding: ${({ theme }: StyledProps) => theme.spacing.medium};
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: ${({ theme }: StyledProps) => theme.spacing.medium};

  &:hover {
    opacity: 0.8;
  }
`;

const SectionContent = styled.div<SectionContentProps>`
  display: ${({ $isVisible }: SectionContentProps) => ($isVisible ? 'block' : 'none')};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }: StyledProps) => theme.colors.primary};
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }: StyledProps) => theme.spacing.small};
`;

const ToggleIcon = styled.i<ToggleIconProps>`
  transition: transform 0.3s ease;
  transform: rotate(${({ $isVisible }: ToggleIconProps) => ($isVisible ? '180deg' : '0deg')});
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${(props: StyledProps) => props.theme.spacing.medium};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const FormGroup = styled.div`
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
  
  .error {
    border-color: ${(props: StyledProps) => props.theme.colors.danger};
    background-color: rgba(220, 53, 69, 0.05);
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
  font-weight: 500;
  color: ${(props: StyledProps) => props.theme.colors.text};
  font-size: 11px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  font-size: 14px;
  background-color: #f8f9fa;
  transition: background-color 0.2s, border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${(props: StyledProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    background-color: #ffffff;
  }
  
  &:hover {
    background-color: #f0f2f5;
  }
  
  &.error {
    border-color: ${(props: StyledProps) => props.theme.colors.danger};
    background-color: rgba(220, 53, 69, 0.05);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  font-size: 14px;
  background-color: #f8f9fa;
  transition: background-color 0.2s, border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${(props: StyledProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    background-color: #ffffff;
  }
  
  &:hover {
    background-color: #f0f2f5;
  }
  
  &.error {
    border-color: ${(props: StyledProps) => props.theme.colors.danger};
    background-color: rgba(220, 53, 69, 0.05);
  }
`;

const Button = styled.button`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #0b5ed7;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background-color: ${(props: StyledProps) => props.theme.colors.secondary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const AddButton = styled(Button)`
  background-color: ${(props: StyledProps) => props.theme.colors.success};
  
  &:hover {
    background-color: #1a8d48;
  }
`;

const SaveButton = styled(Button)`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  
  &:hover {
    background-color: #0b5ed7;
  }
`;

const ListButton = styled(Button)`
  background-color: ${(props: StyledProps) => props.theme.colors.warning};
  
  &:hover {
    background-color: #e09e0b;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
    background-color: ${(props: StyledProps) => props.theme.colors.primary};
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

const TableHeader = styled.th`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  color: white;
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  text-align: left;
`;

const TableCell = styled.td`
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
`;

const ErrorText = styled.div`
  color: ${(props: StyledProps) => props.theme.colors.danger};
  font-size: 14px;
  margin-top: 5px;
`;

const Modal = styled.div`
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
  padding-top: 60px;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  margin: 5% auto;
  padding: 20px;
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  width: 90%;
  max-width: 1200px;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  padding-bottom: 10px;
  margin-bottom: 20px;
  cursor: move;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${(props: StyledProps) => props.theme.colors.primary};
  font-weight: 500;
`;

const ModalBody = styled.div`
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  
  .empty-message {
    text-align: center;
    padding: 20px;
    color: ${(props: StyledProps) => props.theme.colors.secondary};
  }
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

const ActionButton = styled.button`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 12px;
  margin: 0 5px;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #0b5ed7;
    transform: translateY(-1px);
    transition: all 0.2s;
  }
  
  &.delete-button {
    background-color: ${(props: StyledProps) => props.theme.colors.danger};
    
    &:hover {
      background-color: #c0392b;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
  justify-content: flex-start;
  align-items: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  align-items: center;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: ${(props: StyledProps) => props.theme.colors.secondary};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const TotalInfo = styled.div`
  background-color: ${(props: StyledProps) => props.theme.colors.light};
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  margin-top: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const TotalItem = styled.p`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
  
  strong {
    font-weight: 600;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props: StyledProps) => props.theme.spacing.medium};
  gap: 5px;
`;

const PaginationButton = styled.button`
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  border: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  background-color: transparent;
  color: ${(props: StyledProps) => props.theme.colors.text};
  cursor: pointer;
  transition: all ${(props: StyledProps) => props.theme.transitions.default};
  
  &:hover {
    background-color: ${(props: StyledProps) => props.theme.colors.light};
  }
  
  &.active {
    background-color: ${(props: StyledProps) => props.theme.colors.primary};
    border-color: ${(props: StyledProps) => props.theme.colors.primary};
    color: white;
    
    &:hover {
      background-color: #0b5ed7;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled(AddButton)`
  background-color: #6c757d;
  &:hover {
    background-color: #5a6268;
  }
`;

const ResumoContainer = styled.div`
  margin-top: ${(props: StyledProps) => props.theme.spacing.large};
  padding: ${(props: StyledProps) => props.theme.spacing.medium};
  background-color: ${(props: StyledProps) => props.theme.colors.cardBackground};
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  box-shadow: ${(props: StyledProps) => props.theme.shadows.small};
`;

const ResumoTitle = styled.h4`
  color: ${(props: StyledProps) => props.theme.colors.primary};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
  font-size: 1.1rem;
`;

const ResumoEspecie = styled.div`
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const EspecieNome = styled.h5`
  color: ${(props: StyledProps) => props.theme.colors.text};
  font-weight: 600;
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
`;

const DimensaoItem = styled.div`
  margin-left: ${(props: StyledProps) => props.theme.spacing.medium};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
  color: ${(props: StyledProps) => props.theme.colors.text};
  font-size: 0.9rem;
`;

const SubtotalEspecie = styled.div`
  margin-left: ${(props: StyledProps) => props.theme.spacing.medium};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
  color: ${(props: StyledProps) => props.theme.colors.primary};
  font-weight: 500;
`;

const ResumoBitola = styled.div`
  margin-top: ${(props: StyledProps) => props.theme.spacing.medium};
`;

const BitolaTipo = styled.div`
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.small};
  padding-left: ${(props: StyledProps) => props.theme.spacing.medium};
  color: ${(props: StyledProps) => props.theme.colors.text};
`;

const BitolaTotalGeral = styled.div`
  margin-top: ${(props: StyledProps) => props.theme.spacing.medium};
  padding-left: ${(props: StyledProps) => props.theme.spacing.medium};
  color: ${(props: StyledProps) => props.theme.colors.primary};
  font-weight: 600;
`;

// Constantes
const ITENS_POR_PAGINA = 10;
const ROMANEIOS_POR_PAGINA = 6;

// Componente principal
const RomaneioPC: React.FC = () => {
  // Estados
  const [formData, setFormData] = useState<RomaneioForm>({
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    valorUnitario: 0,
    itens: []
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o item atual sendo adicionado
  const [currentItem, setCurrentItem] = useState({
    espessura: '',
    largura: '',
    comprimento: '',
    pecasPorPacote: '1',
    quantidade: '',
    especieId: ''
  });
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  // Estados para validação
  const [errors, setErrors] = useState({
    espessura: false,
    largura: false,
    valorUnitario: false,
    especieId: false
  });
  
  // Estados para visualização de romaneios
  const [romaneiosLista, setRomaneiosLista] = useState<any[]>([]);
  const [modalListaAberto, setModalListaAberto] = useState(false);
  const [editandoRomaneioIndex, setEditandoRomaneioIndex] = useState<number | null>(null);
  const [itemEditando, setItemEditando] = useState<number | null>(null);
  
  // Estados para paginação da lista de romaneios
  const [paginaListaAtual, setPaginaListaAtual] = useState(1);
  
  // Referência para o modal e posição do mouse para funcionalidade de arrastar
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Estados para controle de visibilidade das seções
  const [isInfoGeralVisible, setIsInfoGeralVisible] = useState(true);
  const [isDadosProdutoVisible, setIsDadosProdutoVisible] = useState(true);
  const [isItensVisible, setIsItensVisible] = useState(true);
  
  // Efeito para carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carregar clientes e espécies
        const [clientesData, especiesData] = await Promise.all([
          clientesService.getAll(),
          especiesService.getAll()
        ]);
        
        setClientes(clientesData);
        setEspecies(especiesData);
        
        // Verificar se há um romaneio em edição
        const romaneioEmEdicao = localStorage.getItem('romaneioEmEdicao');
        if (romaneioEmEdicao) {
          try {
            const dados = JSON.parse(romaneioEmEdicao);
            
            // Verifica se os dados contêm um ID válido e se está em modo de edição intencional
            if (dados && dados.id && window.location.search.includes('editar=true')) {
              console.log('Carregando romaneio em edição:', dados.id);
              setFormData(dados);
              setEditandoRomaneioIndex(dados.index);
            } else {
              // Não é um romaneio válido para edição ou não está em modo de edição
              console.log('Limpando dados de edição do localStorage.');
              localStorage.removeItem('romaneioEmEdicao');
              setEditandoRomaneioIndex(null);
            }
          } catch (err) {
            console.error('Erro ao processar dados do localStorage:', err);
            localStorage.removeItem('romaneioEmEdicao');
            setEditandoRomaneioIndex(null);
          }
        } else {
          // Garantir que o modo de edição está desativado quando não há dados no localStorage
          setEditandoRomaneioIndex(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
    
    // Cleanup: remover dados de romaneio em edição ao desmontar o componente
    return () => {
      if (!window.location.search.includes('editar=true')) {
        localStorage.removeItem('romaneioEmEdicao');
      }
    };
  }, []);
  
  // Funções de manuseio de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cliente') {
      const clienteSelecionado = clientes.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        cliente: value,
        clienteNome: clienteSelecionado?.nome || ''
      }));
    } else if (name === 'valorUnitario') {
      // Convertendo o valor para número
      const numeroLimpo = value.replace(/[^\d]/g, '');
      const valorNumerico = numeroLimpo ? parseInt(numeroLimpo) / 100 : 0;
      
      setFormData(prev => ({
        ...prev,
        valorUnitario: valorNumerico
      }));
      
      setErrors(prev => ({ ...prev, valorUnitario: false }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Funções para o item atual
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'espessura') {
      setErrors(prev => ({ ...prev, espessura: false }));
    } else if (name === 'largura') {
      setErrors(prev => ({ ...prev, largura: false }));
    } else if (name === 'especieId') {
      setErrors(prev => ({ ...prev, especieId: false }));
    }
  };
  
  // Função para formatar o valor monetário no input
  const formatValorInput = (valor: number): string => {
    if (valor === undefined || valor === null) {
      return 'R$ 0,00';
    }
    return formatarMoeda(valor);
  };
  
  // Função para formatar bitola
  const formatarBitola = (value: number) => {
    if (value === undefined || value === null) {
      return "0,0 cm";
    }
    return `${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} cm`;
  };
  
  // Função para formatar medida
  const formatarMedida = (value: number) => {
    if (value === undefined || value === null) {
      return "0 cm";
    }
    return `${value} cm`;
  };
  
  // Função para validar inputs
  const validarInputs = (): boolean => {
    let valido = true;
    const novosErros = { ...errors };
    
    const espessura = parseFloat(currentItem.espessura);
    if (isNaN(espessura) || espessura <= 0) {
      novosErros.espessura = true;
      valido = false;
    }
    
    const largura = parseFloat(currentItem.largura);
    if (isNaN(largura) || largura <= 0) {
      novosErros.largura = true;
      valido = false;
    }
    
    if (formData.valorUnitario <= 0) {
      novosErros.valorUnitario = true;
      valido = false;
    }
    
    if (!currentItem.especieId) {
      novosErros.especieId = true;
      valido = false;
    }
    
    setErrors(novosErros);
    return valido;
  };
  
  // Função para adicionar item à lista
  const adicionarItem = () => {
    if (!validarInputs()) {
      return;
    }
    
    // Converter valores para números para evitar erros de tipo
    const espessura = parseFloat(currentItem.espessura.toString());
    const largura = parseFloat(currentItem.largura.toString());
    const comprimento = parseFloat(currentItem.comprimento.toString());
    const pecasPorPacote = parseInt(currentItem.pecasPorPacote.toString());
    const quantidade = parseInt(currentItem.quantidade.toString());
    
    // Obter espécie
    const especieSelecionada = especies.find(e => e.id === currentItem.especieId);
    
    // Calcular volume usando a função utilitária
    // Quando comprimento está em cm, precisamos converter para metros dividindo por 100
    const volumePorPacote = calcularVolumePacote(
      espessura,  // altura/espessura em cm
      largura,    // largura em cm
      comprimento / 100, // comprimento em metros (convertido de cm)
      pecasPorPacote
    );
    
    // Volume total para todos os pacotes
    const volumeTotal = volumePorPacote * quantidade;
    
    // Valor total
    const valorTotal = volumeTotal * formData.valorUnitario;
    
    // Criar novo item
    const novoItem: PacoteItem = {
      id: itemEditando !== null ? itemEditando : Date.now(),
      espessura,
      largura,
      comprimento,
      pecasPorPacote,
      quantidade,
      especieId: currentItem.especieId,
      especieNome: especieSelecionada?.nome || '',
      volume: volumeTotal,
      valorUnitario: formData.valorUnitario,
      valorTotal
    };
    
    // Atualizar a lista de itens
    if (itemEditando !== null) {
      // Estamos editando um item existente
      const novosItens = formData.itens.map(item => 
        item.id === itemEditando ? novoItem : item
      );
      setFormData({
        ...formData,
        itens: novosItens
      });
      // Reset do itemEditando
      setItemEditando(null);
    } else {
      // Estamos adicionando um novo item
      setFormData({
        ...formData,
        itens: [...formData.itens, novoItem]
      });
    }
    
    // Limpar o formulário para o próximo item
    resetItemForm();
    
    // Focar no campo de comprimento após adicionar um item
    setTimeout(() => {
      const comprimentoInput = document.getElementById('comprimento');
      if (comprimentoInput) {
        comprimentoInput.focus();
      }
    }, 0);
  };
  
  // Função para editar um item existente  
  const editarItem = (id: number) => {
    const item = formData.itens.find(item => item.id === id);
    if (item) {
      setCurrentItem({
        espessura: item.espessura.toString(),
        largura: item.largura.toString(),
        comprimento: item.comprimento.toString(),
        pecasPorPacote: item.pecasPorPacote.toString(),
        quantidade: item.quantidade.toString(),
        especieId: item.especieId || ''
      });
      setItemEditando(id);
      
      // Focar no primeiro campo para facilitar a edição
      const comprimentoInput = document.getElementById('comprimento');
      if (comprimentoInput) {
        comprimentoInput.focus();
      }
    }
  };
  
  // Função para resetar o formulário  
  const resetItemForm = () => {
    // Preservar os valores que devem ser mantidos
    const { espessura, largura, pecasPorPacote, especieId } = currentItem;
    
    setCurrentItem({
      espessura,         // Preservar espessura
      largura,           // Preservar largura
      comprimento: '',   // Limpar comprimento
      pecasPorPacote,    // Preservar peças por pacote
      quantidade: '',    // Limpar quantidade
      especieId          // Preservar espécie
    });
    setItemEditando(null);
    // Limpar erros relacionados aos campos do item
    setErrors({
      espessura: false,
      largura: false,
      valorUnitario: false,
      especieId: false
    });
  };
  
  // Função para remover item
  const removerItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== id)
    }));
  };
  
  // Função para salvar o romaneio
  const salvarRomaneio = async () => {
    if (!formData.cliente) {
      alert('Por favor, selecione um cliente');
      return;
    }
    
    if (formData.itens.length === 0) {
      alert('Adicione pelo menos um item ao romaneio');
      return;
    }
    
    // Verificar e corrigir a presença de especieId em cada item
    const itensSemEspecie = formData.itens.filter(item => !item.especieId);
    
    if (itensSemEspecie.length > 0) {
      console.log("Itens sem espécie detectados:", itensSemEspecie);
      
      // Se estamos editando, tentar recuperar a espécie do romaneio original
      if (editandoRomaneioIndex !== null) {
        const romaneioEmEdicao = localStorage.getItem('romaneioEmEdicao');
        if (romaneioEmEdicao) {
          try {
            const dados = JSON.parse(romaneioEmEdicao);
            const especieId = dados.itens[0]?.especieId || '';
            const especieNome = dados.itens[0]?.especieNome || '';
            
            if (especieId) {
              console.log("Usando espécie do romaneio original:", especieId, especieNome);
              
              // Atribuir a espécie do primeiro item válido a todos os itens sem espécie
              const itensCorrigidos = formData.itens.map(item => {
                if (!item.especieId) {
                  return {
                    ...item,
                    especieId,
                    especieNome
                  };
                }
                return item;
              });
              
              setFormData(prev => ({
                ...prev,
                itens: itensCorrigidos
              }));
              
              console.log("Itens corrigidos com espécie:", itensCorrigidos);
            } else {
              alert('Todos os itens devem ter uma espécie selecionada');
              return;
            }
          } catch (err) {
            console.error('Erro ao processar dados para correção de espécies:', err);
            alert('Todos os itens devem ter uma espécie selecionada');
            return;
          }
        } else {
          alert('Todos os itens devem ter uma espécie selecionada');
          return;
        }
      } else {
        alert('Todos os itens devem ter uma espécie selecionada');
        return;
      }
    }
    
    try {
      console.log('Iniciando salvamento do romaneio...');
      
      // Recalcular volumes e valores
      const itensNormalizados = formData.itens.map((item, index) => {
        // Garantir que temos um especieId para cada item
        if (!item.especieId) {
          const primeiroItemComEspecie = formData.itens.find(i => i.especieId);
          if (primeiroItemComEspecie) {
            console.log(`Atribuindo espécie ${primeiroItemComEspecie.especieId} ao item sem espécie`);
            item.especieId = primeiroItemComEspecie.especieId;
            item.especieNome = primeiroItemComEspecie.especieNome;
          }
        }
        
        // Recalcular volume por segurança
        const volumePorPacote = calcularVolumePacote(
          item.espessura,  // altura/espessura em cm
          item.largura,    // largura em cm
          item.comprimento / 100, // comprimento em metros (convertido de cm)
          item.pecasPorPacote
        );
        
        // Volume total (volume por pacote * quantidade de pacotes)
        const volume = volumePorPacote * item.quantidade;
        
        return {
          ...item,
          numero: index + 1, // Adicionar a propriedade numero exigida pela interface RomaneioPCItem
          volume,
          valorTotal: volume * formData.valorUnitario
        };
      });
      
      const volumeTotal = itensNormalizados.reduce((total, item) => total + item.volume, 0);
      const valorTotal = itensNormalizados.reduce((total, item) => total + item.valorTotal, 0);
      
      const clienteSelecionado = clientes.find(c => c.id === formData.cliente);
      
      // Selecionar espécie principal
      const primeiroItemComEspecie = formData.itens.find(item => item.especieId);
      const especieId = primeiroItemComEspecie?.especieId || '';
      const especieNome = primeiroItemComEspecie?.especieNome || '';
      
      console.log('Espécie principal selecionada:', especieId, especieNome);
      
      const romaneioData = {
        tipo: 'PC', // PC = pacote
        cliente: formData.cliente,
        clienteNome: clienteSelecionado?.nome || 'Cliente não encontrado',
        especie: especieId,
        especieNome: especieNome,
        data: new Date(formData.data),
        dataCriacao: new Date(),
        numero: `PC-${Date.now().toString().substring(8)}`,
        itens: itensNormalizados,
        volumeTotal,
        preco: formData.valorUnitario,
        valorTotal,
        empresaId: localStorage.getItem('empresaId') || '1' // Obter do localStorage ou usar um valor padrão
      };
      
      console.log('Dados do romaneio a serem enviados:', romaneioData);
      
      // Variável para armazenar se estávamos no modo de edição antes de salvar
      const estavamosEditando = editandoRomaneioIndex !== null;
      let romaneioId = '';
      
      // Se estiver editando um romaneio existente
      if (estavamosEditando) {
        // Recuperar o ID do romaneio em edição
        const romaneioEmEdicao = localStorage.getItem('romaneioEmEdicao');
        if (romaneioEmEdicao) {
          const { id } = JSON.parse(romaneioEmEdicao);
          romaneioId = id;
          console.log('Atualizando romaneio ID:', id);
          console.log('Itens para atualização:', romaneioData.itens);
          
          await romaneiosService.update(id, romaneioData);
          console.log('Romaneio atualizado com sucesso!');
          
          // Verificar se a atualização foi bem-sucedida
          const romaneioAtualizado = await romaneiosService.getById(id);
          console.log('Romaneio após atualização:', romaneioAtualizado);
          
          alert('Romaneio atualizado com sucesso!');
          
          // Forçar recarga da página após atualização
          localStorage.removeItem('romaneioEmEdicao');
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
          return; // Sair da função para evitar processamento adicional
        } else {
          alert('Erro: Não foi possível recuperar o ID do romaneio em edição');
          return;
        }
      } else {
        // Cria um novo romaneio
        console.log('Criando novo romaneio:', romaneioData);
        romaneioId = await romaneiosService.create(romaneioData);
        console.log(`Novo romaneio criado com ID: ${romaneioId}`);
        alert('Romaneio salvo com sucesso!');
        
        // Atualizar a lista de romaneios sem esperar o usuário clicar em "Listar Romaneios"
        try {
          // Buscar todos os romaneios para garantir dados atualizados
          const todosRomaneios = await romaneiosService.getAll();
          console.log('Todos os romaneios após criar novo:', todosRomaneios);
          
          // Filtrar por tipo PC
          const romaneiosPC = todosRomaneios.filter(romaneio => {
            const tipoLowerCase = romaneio.tipo ? romaneio.tipo.toLowerCase() : '';
            return tipoLowerCase === 'pc';
          });
          
          console.log(`Romaneios PC após criar novo (total: ${romaneiosPC.length}):`, romaneiosPC);
          setRomaneiosLista(romaneiosPC);
        } catch (error) {
          console.error('Erro ao atualizar lista de romaneios após salvar:', error);
        }
      }
      
      // Limpa o localStorage e remove parâmetro de URL
      localStorage.removeItem('romaneioEmEdicao');
      const url = new URL(window.location.href);
      url.searchParams.delete('editar');
      window.history.pushState({}, '', url);
      
      // Usar location.replace para forçar uma navegação completa para a URL sem parâmetros se estávamos editando
      if (estavamosEditando) {
        // Redirecionamento com um pequeno delay para garantir que os estados foram atualizados
        setTimeout(() => {
          window.location.href = url.toString();
        }, 500);
        
        return; // Sair da função aqui, pois a página será recarregada
      }
      
      // Reseta o formulário completamente (executado apenas se não estiver editando)
      setFormData({
        cliente: '',
        data: new Date().toISOString().split('T')[0],
        valorUnitario: 0,
        itens: []
      });
      
      // Reseta o item atual
      setCurrentItem({
        espessura: '',
        largura: '',
        comprimento: '',
        pecasPorPacote: '1',
        quantidade: '',
        especieId: ''
      });
      
      // Reseta o índice do romaneio em edição
      setEditandoRomaneioIndex(null);
      
      // Define a página atual para 1
      setPaginaAtual(1);
      
    } catch (error) {
      console.error('Erro ao salvar romaneio:', error);
      alert('Erro ao salvar romaneio. Tente novamente.');
    }
  };
  
  // Função para mostrar a lista de romaneios existentes
  const mostrarListaRomaneios = async () => {
    try {
      console.log('Iniciando busca de romaneios PC...');
      
      // Primeiro obter todos os romaneios para debug
      const todosRomaneios = await romaneiosService.getAll();
      console.log('Todos os romaneios disponíveis:', todosRomaneios);
      
      // Filtrar para obter apenas os do tipo 'PC' ou 'pc' (insensível a maiúsculas/minúsculas)
      const romaneiosPC = todosRomaneios.filter(romaneio => {
        const tipoLowerCase = romaneio.tipo ? romaneio.tipo.toLowerCase() : '';
        console.log(`Romaneio ID: ${romaneio.id}, tipo: ${tipoLowerCase}, match: ${tipoLowerCase === 'pc'}`);
        return tipoLowerCase === 'pc';
      });
      
      console.log(`Total de romaneios PC encontrados: ${romaneiosPC.length}`);
      console.log('Romaneios filtrados (PC):', romaneiosPC);
      
      // Verificação adicional para garantir que apenas romaneios PC foram retornados
      const verificacaoTipos = romaneiosPC.every(r => r.tipo && r.tipo.toLowerCase() === 'pc');
      console.log('Todos os romaneios filtrados são do tipo PC:', verificacaoTipos);
      
      // Ordenar romaneios por data decrescente (mais recentes primeiro)
      const romaneiosOrdenados = [...romaneiosPC].sort((a, b) => {
        // Comparar pela data, depois pelo ID (para garantir consistência)
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();
        
        if (dataA !== dataB) {
          return dataB - dataA; // Ordem decrescente por data
        }
        
        // Se as datas forem iguais, ordenar pelo ID
        return b.id.localeCompare(a.id);
      });
      
      setRomaneiosLista(romaneiosOrdenados);
      setPaginaListaAtual(1); // Resetar a página para 1 ao abrir a lista
      setModalListaAberto(true);
      
      if (romaneiosPC.length === 0) {
        console.log('Nenhum romaneio do tipo PC encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar romaneios:', error);
      alert('Erro ao carregar romaneios. Tente novamente.');
    }
  };
  
  // Função para editar um romaneio
  const editarRomaneio = (id: string) => {
    const romaneio = romaneiosLista.find(r => r.id === id);
    if (!romaneio) {
      console.error('Romaneio não encontrado com ID:', id);
      alert('Romaneio não encontrado.');
      return;
    }
    
    console.log('Editando romaneio:', romaneio);
    
    // Preparar dados para edição
    const dadosParaEdicao = {
      cliente: romaneio.cliente || '',
      clienteNome: romaneio.clienteNome || '',
      data: new Date(romaneio.data).toISOString().split('T')[0],
      valorUnitario: romaneio.preco || 0,
      itens: Array.isArray(romaneio.itens) ? romaneio.itens.map((item: any) => ({
        id: item.id || Date.now() + Math.random(),
        espessura: item.espessura || 0,
        largura: item.largura || 0,
        comprimento: item.comprimento || 0,
        pecasPorPacote: item.pecasPorPacote || 0,
        quantidade: item.quantidade || 0,
        volume: item.volume || 0,
        valorUnitario: romaneio.preco || 0,
        valorTotal: (item.volume || 0) * (romaneio.preco || 0),
        especieId: item.especieId || '',
        especieNome: item.especieNome || ''
      })) : []
    };
    
    // Adicionar parâmetro de consulta para indicar modo de edição
    const url = new URL(window.location.href);
    url.searchParams.set('editar', 'true');
    window.history.pushState({}, '', url);
    
    // Salvar no localStorage para persistir durante edição
    localStorage.setItem('romaneioEmEdicao', JSON.stringify({
      ...dadosParaEdicao,
      id: romaneio.id,
      index: romaneiosLista.findIndex(r => r.id === id)
    }));
    
    // Atualizar o formulário
    setFormData(dadosParaEdicao);
    setEditandoRomaneioIndex(romaneiosLista.findIndex(r => r.id === id));
    
    // Resetar o currentItem
    setCurrentItem({
      espessura: '',
      largura: '',
      comprimento: '',
      pecasPorPacote: '1',
      quantidade: '',
      especieId: ''
    });
    
    // Definir a página para 1
    setPaginaAtual(1);
    
    // Fechar o modal
    setModalListaAberto(false);
    
    console.log('Romaneio carregado para edição com sucesso');
  };
  
  // Função para excluir um romaneio
  const excluirRomaneio = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este romaneio?')) {
      try {
        console.log('Excluindo romaneio ID:', id);
        await romaneiosService.delete(id);
        
        // Atualiza a lista de romaneios usando o mesmo método da função mostrarListaRomaneios
        const todosRomaneios = await romaneiosService.getAll();
        const romaneiosPC = todosRomaneios.filter(romaneio => {
          const tipoLowerCase = romaneio.tipo ? romaneio.tipo.toLowerCase() : '';
          return tipoLowerCase === 'pc';
        });
        
        console.log('Romaneios restantes após exclusão:', romaneiosPC);
        setRomaneiosLista(romaneiosPC);
        
        alert('Romaneio excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir romaneio:', error);
        alert('Erro ao excluir romaneio. Tente novamente.');
      }
    }
  };
  
  // Funções para paginação da lista de romaneios
  const totalPaginasLista = Math.ceil(romaneiosLista.length / ROMANEIOS_POR_PAGINA);
  
  const romaneiosAtuais = romaneiosLista
    .slice((paginaListaAtual - 1) * ROMANEIOS_POR_PAGINA, paginaListaAtual * ROMANEIOS_POR_PAGINA);

  // Funções para paginação dos itens do formulário
  const totalPaginas = Math.ceil(formData.itens.length / ITENS_POR_PAGINA);
  
  // Inverter a ordem dos itens para que o último adicionado apareça primeiro
  const itensInvertidos = [...formData.itens].reverse();
  
  const itensAtual = itensInvertidos
    .slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);
  
  // Calcular totais
  const totalPacotes = formData.itens.reduce((total, item) => total + item.quantidade, 0);
  const volumeTotal = formData.itens.reduce((total, item) => total + item.volume, 0);
  const valorTotal = formData.itens.reduce((total, item) => total + item.valorTotal, 0);
  
  // Função para tratar a tecla Enter nos campos do formulário
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (nextFieldId === 'adicionar') {
        // Se o próximo campo for 'adicionar', então adiciona o item
        adicionarItem();
        // Após adicionar, move o foco para o campo de comprimento
        const comprimentoInput = document.getElementById('comprimento');
        if (comprimentoInput) {
          comprimentoInput.focus();
        }
      } else if (nextFieldId) {
        // Move o foco para o próximo campo
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      }
    }
  };
  
  // Funções para tornar o modal arrastável
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
  
  // Adicionar e remover os listeners de eventos
  useEffect(() => {
    if (modalListaAberto) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [modalListaAberto, isDragging, dragOffset]);
  
  // Adicionar função para identificar o produto antes da função gerarResumo
  const identificarProduto = (espessura: number, largura: number): string => {
    if (espessura > 12 && largura >= 12) {
      return 'Bloco, Quadrado ou Filé';
    } else if (espessura > 7 && largura >= 20) {
      return 'Pranchão';
    } else if (espessura >= 4 && espessura <= 7 && largura >= 20) {
      return 'Prancha';
    } else if (espessura >= 4 && largura >= 11 && largura <= 20) {
      return 'Viga';
    } else if (espessura >= 4 && espessura <= 11 && largura >= 8 && largura <= 10.9) {
      return 'Vigota';
    } else if (espessura >= 4 && espessura <= 8 && largura >= 4 && largura <= 7.9) {
      return 'Caibro';
    } else if (espessura >= 1 && espessura <= 3.9 && largura > 10) {
      return 'Tábua';
    } else if (espessura >= 2 && espessura <= 3.9 && largura >= 2 && largura <= 10) {
      return 'Sarrafos';
    } else if (espessura < 2 && largura >= 10) {
      return 'Ripa';
    }
    return 'Outros';
  };
  
  // Modificar a função gerarResumo para incluir o resumo por bitola
  const gerarResumo = (itens: PacoteItem[]) => {
    // Agrupar por espécie
    const resumoPorEspecie = itens.reduce((acc, item) => {
      const especieNome = item.especieNome || 'Sem Espécie';
      const dimensaoKey = `${item.espessura}x${item.largura}`;
      
      if (!acc[especieNome]) {
        acc[especieNome] = {
          dimensoes: {},
          totalVolume: 0,
          totalUnidades: 0
        };
      }
      
      if (!acc[especieNome].dimensoes[dimensaoKey]) {
        acc[especieNome].dimensoes[dimensaoKey] = {
          volume: 0,
          unidades: 0
        };
      }
      
      acc[especieNome].dimensoes[dimensaoKey].volume += item.volume;
      acc[especieNome].dimensoes[dimensaoKey].unidades += item.quantidade;
      acc[especieNome].totalVolume += item.volume;
      acc[especieNome].totalUnidades += item.quantidade;
      
      return acc;
    }, {} as Record<string, any>);

    // Novo: Agrupar por tipo de produto
    const resumoPorBitola = itens.reduce((acc, item) => {
      const tipoProduto = identificarProduto(item.espessura, item.largura);
      
      if (!acc[tipoProduto]) {
        acc[tipoProduto] = {
          volume: 0,
          unidades: 0,
          itens: []
        };
      }
      
      acc[tipoProduto].volume += item.volume;
      acc[tipoProduto].unidades += item.quantidade;
      acc[tipoProduto].itens.push(item);
      
      return acc;
    }, {} as Record<string, any>);

    const volumeTotalGeral = Object.values(resumoPorBitola).reduce((total: number, dados: any) => total + dados.volume, 0);
    const unidadesTotalGeral = Object.values(resumoPorBitola).reduce((total: number, dados: any) => total + dados.unidades, 0);

    return (
      <>
        <ResumoContainer>
          <ResumoTitle>Resumo por Espécie, Espessura e Largura</ResumoTitle>
          {Object.entries(resumoPorEspecie).map(([especieNome, dados]: [string, any]) => (
            <ResumoEspecie key={especieNome}>
              <EspecieNome>{especieNome}</EspecieNome>
              {Object.entries(dados.dimensoes).map(([dimensao, info]: [string, any]) => (
                <DimensaoItem key={dimensao}>
                  {dimensao} - TOTAL: {formatarVolume(info.volume)} ({info.unidades} unidades)
                </DimensaoItem>
              ))}
              <SubtotalEspecie>
                Subtotal {especieNome}: {formatarVolume(dados.totalVolume)} ({dados.totalUnidades} unidades)
              </SubtotalEspecie>
            </ResumoEspecie>
          ))}
        </ResumoContainer>

        <ResumoContainer>
          <ResumoTitle>Resumo por Tipo de Bitola</ResumoTitle>
          {Object.entries(resumoPorBitola).map(([tipo, dados]: [string, any]) => (
            <ResumoBitola key={tipo}>
              <BitolaTipo>
                {tipo} - TOTAL: {formatarVolume(dados.volume)} ({dados.unidades} unidades)
              </BitolaTipo>
            </ResumoBitola>
          ))}
          <BitolaTotalGeral>
            Total Geral: {formatarVolume(volumeTotalGeral)} ({unidadesTotalGeral} unidades)
          </BitolaTotalGeral>
        </ResumoContainer>
      </>
    );
  };
  
  if (loading) {
    return <Container>Carregando dados...</Container>;
  }
  
  return (
    <Container>
      <PageHeader 
        title="Romaneio Pacote"
        description="Registre romaneios de madeira em formato de pacotes com múltiplas peças."
      />

      <FormContainer>
        {/* Seção de Informações Gerais */}
        <FormSection>
          <SectionHeader onClick={() => setIsInfoGeralVisible(!isInfoGeralVisible)}>
            <SectionTitle>
              <ToggleIcon 
                className="fas fa-chevron-down" 
                $isVisible={isInfoGeralVisible} 
              />
              Informações Gerais
            </SectionTitle>
          </SectionHeader>
          <SectionContent $isVisible={isInfoGeralVisible}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="cliente">Cliente:</Label>
                <Select
                  id="cliente"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="data">Data:</Label>
                <Input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            </FormRow>
          </SectionContent>
        </FormSection>

        {/* Seção de Dados do Produto */}
        <FormSection>
          <SectionHeader onClick={() => setIsDadosProdutoVisible(!isDadosProdutoVisible)}>
            <SectionTitle>
              <ToggleIcon 
                className="fas fa-chevron-down" 
                $isVisible={isDadosProdutoVisible} 
              />
              Dados do Produto
            </SectionTitle>
          </SectionHeader>
          <SectionContent $isVisible={isDadosProdutoVisible}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="valorUnitario">Preço por m³:</Label>
                <Input
                  type="text"
                  id="valorUnitario"
                  name="valorUnitario"
                  value={formatValorInput(formData.valorUnitario)}
                  onChange={handleInputChange}
                  className={errors.valorUnitario ? 'error' : ''}
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'bitola')}
                />
                {errors.valorUnitario && <ErrorText>Digite um valor válido</ErrorText>}
              </FormGroup>
            </FormRow>
          </SectionContent>
        </FormSection>

        {/* Seção de Itens do Romaneio */}
        <FormSection>
          <SectionHeader onClick={() => setIsItensVisible(!isItensVisible)}>
            <SectionTitle>
              <ToggleIcon 
                className="fas fa-chevron-down" 
                $isVisible={isItensVisible} 
              />
              Itens do Romaneio
            </SectionTitle>
          </SectionHeader>
          <SectionContent $isVisible={isItensVisible}>
            <InfoText>
              Preencha as dimensões em centímetros para espessura e largura, e em metros para o comprimento.
              Indique a quantidade de peças por pacote e o número de pacotes.
            </InfoText>

            <FormRow style={{ display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'nowrap' }}>
              <FormGroup style={{ flex: '0 0 120px' }}>
                <Label htmlFor="comprimento">Comprimento (cm):</Label>
                <Input
                  type="number"
                  id="comprimento"
                  name="comprimento"
                  value={currentItem.comprimento}
                  onChange={handleItemChange}
                  min="0.1"
                  step="0.1"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'quantidade')}
                />
              </FormGroup>
              
              <FormGroup style={{ flex: '0 0 100px' }}>
                <Label htmlFor="quantidade">Quantidade:</Label>
                <Input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  value={currentItem.quantidade}
                  onChange={handleItemChange}
                  min="1"
                  step="1"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'espessura')}
                />
              </FormGroup>

              <FormGroup style={{ flex: '0 0 120px' }}>
                <Label htmlFor="espessura">Espessura (cm):</Label>
                <Input
                  type="number"
                  id="espessura"
                  name="espessura"
                  value={currentItem.espessura}
                  onChange={handleItemChange}
                  min="0.1"
                  step="0.1"
                  required
                  className={errors.espessura ? 'error' : ''}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'largura')}
                />
                {errors.espessura && <ErrorText>Digite uma espessura válida</ErrorText>}
              </FormGroup>

              <FormGroup style={{ flex: '0 0 120px' }}>
                <Label htmlFor="largura">Largura (cm):</Label>
                <Input
                  type="number"
                  id="largura"
                  name="largura"
                  value={currentItem.largura}
                  onChange={handleItemChange}
                  min="0.1"
                  step="0.1"
                  required
                  className={errors.largura ? 'error' : ''}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'pecasPorPacote')}
                />
                {errors.largura && <ErrorText>Digite uma largura válida</ErrorText>}
              </FormGroup>
              
              <FormGroup style={{ flex: '0 0 130px' }}>
                <Label htmlFor="pecasPorPacote">Peças por Pacote:</Label>
                <Input
                  type="number"
                  id="pecasPorPacote"
                  name="pecasPorPacote"
                  value={currentItem.pecasPorPacote}
                  onChange={handleItemChange}
                  min="1"
                  step="1"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'adicionar')}
                />
              </FormGroup>

              <FormGroup style={{ flex: '1 1 auto' }}>
                <Label htmlFor="especieId">Espécie do Item:</Label>
                <Select
                  id="especieId"
                  name="especieId"
                  value={currentItem.especieId}
                  onChange={handleItemChange}
                  required
                  className={errors.especieId ? 'error' : ''}
                  onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => handleKeyDown(e, 'adicionar')}
                >
                  <option value="">Selecione uma espécie</option>
                  {especies.map(especie => (
                    <option key={especie.id} value={especie.id}>
                      {especie.nome}
                    </option>
                  ))}
                </Select>
                {errors.especieId && <ErrorText>Selecione uma espécie</ErrorText>}
              </FormGroup>
            </FormRow>

            <ButtonsContainer>
              <AddButton type="button" onClick={adicionarItem}>
                <i className={itemEditando !== null ? "fas fa-save" : "fas fa-plus"}></i> 
                {itemEditando !== null ? 'Atualizar Item' : 'Adicionar Item'}
              </AddButton>
              {itemEditando !== null && (
                <ButtonSecondary type="button" onClick={() => {
                  setItemEditando(null);
                  resetItemForm();
                }}>
                  <i className="fas fa-times"></i> Cancelar Edição
                </ButtonSecondary>
              )}
              <SaveButton type="button" onClick={salvarRomaneio}>
                <i className="fas fa-save"></i> {editandoRomaneioIndex !== null ? 'Atualizar Romaneio' : 'Salvar Romaneio'}
              </SaveButton>
              <ListButton type="button" onClick={mostrarListaRomaneios}>
                <i className="fas fa-list"></i> Listar Romaneios
              </ListButton>
            </ButtonsContainer>
          </SectionContent>
        </FormSection>

        {/* Tabela de itens */}
        <FormSection>
          <SectionTitle>Tabela de Itens</SectionTitle>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Compr.</TableHeader>
                  <TableHeader>Quant.</TableHeader>
                  <TableHeader>Espes.</TableHeader>
                  <TableHeader>Larg.</TableHeader>
                  <TableHeader>Peças/Pct</TableHeader>
                  <TableHeader>Espécie</TableHeader>
                  <TableHeader>Volume</TableHeader>
                  <TableHeader>Valor</TableHeader>
                  <TableHeader>Ações</TableHeader>
                </tr>
              </thead>
              <tbody>
                {itensAtual.length > 0 ? (
                  itensAtual.map(item => (
                    <tr key={item.id}>
                      <TableCell>{formatarMedida(item.comprimento)}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatarBitola(item.espessura)}</TableCell>
                      <TableCell>{formatarMedida(item.largura)}</TableCell>
                      <TableCell>{item.pecasPorPacote}</TableCell>
                      <TableCell>
                        {item.especieNome || ''}
                      </TableCell>
                      <TableCell>{formatarVolume(item.volume)}</TableCell>
                      <TableCell>{formatarMoeda(item.valorTotal)}</TableCell>
                      <TableCell>
                        <ButtonGroup>
                          <ActionButton 
                            type="button" 
                            onClick={() => editarItem(item.id)}
                            title="Editar"
                            style={{ backgroundColor: '#28a745' }}
                          >
                            <i className="fas fa-edit"></i>
                          </ActionButton>
                          <ActionButton 
                            type="button" 
                            className="delete-button" 
                            onClick={() => removerItem(item.id)}
                            title="Excluir"
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        </ButtonGroup>
                      </TableCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <TableCell colSpan={9} style={{ textAlign: 'center' }}>
                      Nenhum item adicionado
                    </TableCell>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </FormSection>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => setPaginaAtual(1)}
              disabled={paginaAtual === 1}
            >
              &laquo;
            </PaginationButton>
            <PaginationButton
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
            >
              &lsaquo;
            </PaginationButton>
            
            {/* Exibe os números de página */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPaginas || 
                (page >= paginaAtual - 1 && page <= paginaAtual + 1)
              )
              .map(page => (
                <React.Fragment key={page}>
                  {page > 1 && page - 1 !== paginaAtual - 1 && paginaAtual - 2 !== 1 && page !== 2 && (
                    <PaginationButton disabled>...</PaginationButton>
                  )}
                  <PaginationButton
                    onClick={() => setPaginaAtual(page)}
                    className={page === paginaAtual ? 'active' : ''}
                  >
                    {page}
                  </PaginationButton>
                </React.Fragment>
              ))}
            
            <PaginationButton
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
            >
              &rsaquo;
            </PaginationButton>
            <PaginationButton
              onClick={() => setPaginaAtual(totalPaginas)}
              disabled={paginaAtual === totalPaginas}
            >
              &raquo;
            </PaginationButton>
          </PaginationContainer>
        )}

        {/* Resumo de totais */}
        <TotalInfo>
          <TotalItem>
            <strong>Total de Pacotes:</strong> <span>{totalPacotes}</span>
          </TotalItem>
          <TotalItem>
            <strong>Volume Total:</strong> <span>{formatarVolume(volumeTotal)} m³</span>
          </TotalItem>
          <TotalItem>
            <strong>Valor Total:</strong> <span>{formatarMoeda(valorTotal)}</span>
          </TotalItem>
        </TotalInfo>
        
        {formData.itens.length > 0 && gerarResumo(formData.itens)}
      </FormContainer>

      {/* Modal para listagem de romaneios */}
      {modalListaAberto && (
        <Modal>
          <ModalContent ref={modalRef}>
            <ModalHeader onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleMouseDown(e)}>
              <ModalTitle>Lista de Romaneios PC</ModalTitle>
              <CloseButton onClick={() => setModalListaAberto(false)}>
                <i className="fas fa-times"></i>
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {romaneiosLista.length > 0 ? (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Número</TableHeader>
                        <TableHeader>Cliente</TableHeader>
                        <TableHeader>Data</TableHeader>
                        <TableHeader>Espécie</TableHeader>
                        <TableHeader>Volume</TableHeader>
                        <TableHeader>Valor</TableHeader>
                        <TableHeader>Ações</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {romaneiosAtuais.map(romaneio => {
                        const volumeTotal = romaneio.volumeTotal || 
                          (romaneio.itens ? 
                            romaneio.itens.reduce((sum: number, item: any) => sum + item.volume, 0) : 0);
                        
                        const valorTotal = romaneio.valorTotal || 
                          (romaneio.itens && romaneio.preco ? 
                            volumeTotal * romaneio.preco : 0);
                        
                        return (
                          <tr key={romaneio.id}>
                            <TableCell>{romaneio.numero || '---'}</TableCell>
                            <TableCell>{romaneio.clienteNome}</TableCell>
                            <TableCell>{new Date(romaneio.data).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              {romaneio.itens && romaneio.itens.length > 0 && romaneio.itens[0].especieNome 
                                ? romaneio.itens[0].especieNome 
                                : romaneio.especieNome || 'Sem espécie'}
                            </TableCell>
                            <TableCell>{formatarVolume(volumeTotal)}</TableCell>
                            <TableCell>{formatarMoeda(valorTotal)}</TableCell>
                            <TableCell>
                              <ButtonGroup>
                                <ActionButton 
                                  type="button" 
                                  onClick={() => editarRomaneio(romaneio.id)}
                                  title="Editar"
                                >
                                  <i className="fas fa-edit"></i>
                                </ActionButton>
                                <ActionButton 
                                  type="button" 
                                  onClick={() => excluirRomaneio(romaneio.id)}
                                  title="Excluir"
                                >
                                  <i className="fas fa-trash"></i>
                                </ActionButton>
                                <PrintRomaneioButton 
                                  romaneio={{
                                    ...romaneio,
                                    tipo: 'PC',
                                    itens: romaneio.itens.map((item: any) => ({
                                      ...item,
                                      valorUnitario: romaneio.preco || 0
                                    }))
                                  }}
                                />
                              </ButtonGroup>
                            </TableCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  
                  {/* Paginação para lista de romaneios */}
                  {totalPaginasLista > 1 && (
                    <PaginationContainer>
                      <PaginationButton
                        onClick={() => setPaginaListaAtual(1)}
                        disabled={paginaListaAtual === 1}
                      >
                        &laquo;
                      </PaginationButton>
                      <PaginationButton
                        onClick={() => setPaginaListaAtual(prev => Math.max(prev - 1, 1))}
                        disabled={paginaListaAtual === 1}
                      >
                        &lsaquo;
                      </PaginationButton>
                      
                      {/* Exibe os números de página */}
                      {Array.from({ length: totalPaginasLista }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPaginasLista || 
                          (page >= paginaListaAtual - 1 && page <= paginaListaAtual + 1)
                        )
                        .map(page => (
                          <React.Fragment key={page}>
                            {page > 1 && page - 1 !== paginaListaAtual - 1 && paginaListaAtual - 2 !== 1 && page !== 2 && (
                              <PaginationButton disabled>...</PaginationButton>
                            )}
                            <PaginationButton
                              onClick={() => setPaginaListaAtual(page)}
                              className={page === paginaListaAtual ? 'active' : ''}
                            >
                              {page}
                            </PaginationButton>
                          </React.Fragment>
                        ))}
                      
                      <PaginationButton
                        onClick={() => setPaginaListaAtual(prev => Math.min(prev + 1, totalPaginasLista))}
                        disabled={paginaListaAtual === totalPaginasLista}
                      >
                        &rsaquo;
                      </PaginationButton>
                      <PaginationButton
                        onClick={() => setPaginaListaAtual(totalPaginasLista)}
                        disabled={paginaListaAtual === totalPaginasLista}
                      >
                        &raquo;
                      </PaginationButton>
                    </PaginationContainer>
                  )}
                </>
              ) : (
                <p className="empty-message">Nenhum romaneio PC encontrado.</p>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RomaneioPC; 