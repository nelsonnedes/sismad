import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { clientesService, Cliente, especiesService, Especie, romaneiosService } from '../../services/firebaseService';
import { calcularVolumePeca, formatarVolume, formatarMoeda } from '../../utils/madeira';
import { ThemeType } from '../../styles/theme';
import PrintRomaneioButton from '../../components/romaneios/PrintRomaneioButton';
import { Romaneio } from '../../components/romaneios/PrintRomaneio';
import PageHeader from '../../components/PageHeader';

// Interfaces
interface Item {
  id: number;
  largura: number;
  comprimento: number;
  bitola: number; // Equivalente a espessura no código antigo
  especieId?: string; // ID da espécie específica para este item (opcional)
  especieNome?: string; // Nome da espécie específica
  quantidade: number;
  volume: number;
  valorUnitario: number;
  valorTotal: number;
}

interface RomaneioForm {
  cliente: string;
  clienteNome?: string;
  especie: string;
  especieNome?: string;
  data: string;
  valorUnitario: number;
  itens: Item[];
}

interface StyledProps {
  theme: ThemeType;
}

// Adicionar um tipo explícito para ItemForm
interface ItemForm {
  id?: string | number;
  bitola: number;
  largura: number;
  comprimento: number;
  quantidade: number;
  especieId: string; // Garantir que é sempre string, nunca undefined
  especieNome?: string;
  volume: number;
  valorUnitario: number;
  valorTotal: number;
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

const SectionContent = styled.div<{ $isVisible: boolean }>`
  display: ${({ $isVisible }: { $isVisible: boolean }) => ($isVisible ? 'block' : 'none')};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }: StyledProps) => theme.colors.primary};
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }: StyledProps) => theme.spacing.small};
`;

const ToggleIcon = styled.i<{ $isVisible: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${({ $isVisible }: { $isVisible: boolean }) => ($isVisible ? '180deg' : '0deg')});
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
  overflow: hidden;
`;

const ModalHeader = styled.div<{ onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  padding-bottom: 10px;
  margin-bottom: 20px;
  cursor: move; /* Indicar que o cabeçalho é arrastável */
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

// Constante para paginação
const ITENS_POR_PAGINA = 10;

// Adicionar a definição do componente ButtonSecondary (após a definição de Button)
const ButtonSecondary = styled(AddButton)`
  background-color: #6c757d;
  &:hover {
    background-color: #5a6268;
  }
`;

// Adicionar constante para paginação da lista de romaneios
const ROMANEIOS_POR_PAGINA = 6;

// Componente principal
const RomaneioTL: React.FC = () => {
  // Estados
  const [formData, setFormData] = useState<RomaneioForm>({
    cliente: '',
    especie: '',
    data: new Date().toISOString().split('T')[0],
    valorUnitario: 0,
    itens: []
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o item atual sendo adicionado
  const [currentItem, setCurrentItem] = useState<{
    bitola: string;
    largura: string;
    comprimento: string;
    quantidade: string;
    especieId: string; // Garantir que é sempre string, nunca undefined
  }>({
    bitola: '',
    largura: '',
    comprimento: '',
    quantidade: '1',
    especieId: ''
  });
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  
  // Estados para validação
  const [errors, setErrors] = useState({
    bitola: false,
    valorUnitario: false,
    especieId: false
  });
  
  // Estados para visualização de romaneios
  const [romaneiosLista, setRomaneiosLista] = useState<any[]>([]);
  const [modalListaAberto, setModalListaAberto] = useState(false);
  const [editandoRomaneioIndex, setEditandoRomaneioIndex] = useState<number | null>(null);
  const [itemEditando, setItemEditando] = useState<number | null>(null);
  
  // Adicionar um indicador de salvamento em progresso
  const salvarEmProgresso = React.useRef<boolean>(false);
  
  // Adicionar estado para paginação da lista de romaneios
  const [paginaListaAtual, setPaginaListaAtual] = useState(1);
  
  // Referência para o modal e posição do mouse para funcionalidade de arrastar
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Estados para controle de visibilidade das seções
  const [isInfoGeralVisible, setIsInfoGeralVisible] = useState(true);
  const [isDadosProdutoVisible, setIsDadosProdutoVisible] = useState(true);
  const [isItensVisible, setIsItensVisible] = useState(true);
  
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
  
  // Effect para carregar dados iniciais
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
        const romaneioEmEdicao = localStorage.getItem('romaneioTLEmEdicao');
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
              localStorage.removeItem('romaneioTLEmEdicao');
              setEditandoRomaneioIndex(null);
            }
          } catch (err) {
            console.error('Erro ao processar dados do localStorage:', err);
            localStorage.removeItem('romaneioTLEmEdicao');
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
        localStorage.removeItem('romaneioTLEmEdicao');
      }
    };
  }, []);
  
  // Manipuladores de eventos
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    
    if (name === 'cliente') {
      const clienteSelecionado = clientes.find(c => c.id === value);
      setFormData({
        ...formData,
        cliente: value,
        clienteNome: clienteSelecionado?.nome || ''
      });
    } else if (name === 'valorUnitario') {
      // Convertendo o valor para número (igual ao RomaneioPC)
      const numeroLimpo = value.replace(/[^\d]/g, '');
      const valorNumerico = numeroLimpo ? parseInt(numeroLimpo) / 100 : 0;
      
      setFormData({
        ...formData,
        valorUnitario: valorNumerico
      });
      
      setErrors(prev => ({ ...prev, valorUnitario: false }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleItemChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setCurrentItem({
      ...currentItem,
      [name]: value
    });
    
    // Resetar erros ao modificar valores
    if (name === 'bitola') {
      setErrors(prev => ({ ...prev, bitola: false }));
    } else if (name === 'especieId') {
      setErrors(prev => ({ ...prev, especieId: false }));
    }
  };
  
  // Função para adicionar um novo item à lista
  const adicionarItem = () => {
    // Validação dos campos
    if (!validateItemFields()) {
      return;
    }
    
    console.log('Adicionando/atualizando item com dados:', currentItem);
    
    // Converter valores para números para evitar erros de tipo
    const largura = parseFloat(currentItem.largura.toString());
    const comprimento = parseFloat(currentItem.comprimento.toString());
    const bitola = parseFloat(currentItem.bitola.toString());
    const quantidade = parseInt(currentItem.quantidade.toString());
    
    // Calcular o volume: (largura x comprimento x bitola x quantidade) / 1000000 para conversão de cm³ para m³
    const especieSelecionada = especies.find(e => e.id === currentItem.especieId);
    const volume = (largura * comprimento * bitola * quantidade) / 1000000;
    const valorTotal = volume * formData.valorUnitario;
    
    // Criar novo item
    const novoItem: Item = {
      id: itemEditando !== null ? itemEditando : Date.now(),
      largura,
      comprimento,
      bitola,
      especieId: currentItem.especieId,
      especieNome: especieSelecionada?.nome || '',
      quantidade,
      volume,
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
    
    // Resetar o form para o próximo item
    resetItemForm();

    // Focar no campo de comprimento após adicionar um item
    setTimeout(() => {
      const comprimentoInput = document.getElementById('comprimento');
      if (comprimentoInput) {
        comprimentoInput.focus();
      }
    }, 0);
  };
  
  // Adicionar a função para editar um item existente
  const editarItem = (id: number) => {
    const item = formData.itens.find(item => item.id === id);
    if (item) {
      setCurrentItem({
        largura: item.largura.toString(),
        comprimento: item.comprimento.toString(),
        bitola: item.bitola.toString(),
        especieId: item.especieId || '',
        quantidade: item.quantidade.toString()
      });
      setItemEditando(id);
      
      // Focar no primeiro campo para facilitar a edição
      const bitolaInput = document.getElementById('bitola');
      if (bitolaInput) {
        bitolaInput.focus();
      }
    }
  };
  
  // Função resetItemForm modificada para preservar bitola e especieId
  const resetItemForm = () => {
    // Salvar os valores que devem ser preservados
    const { bitola, especieId } = currentItem;
    
    setCurrentItem({
      largura: '',
      comprimento: '',
      bitola, // Preservar o valor da bitola (espessura)
      especieId, // Preservar o valor da espécie
      quantidade: '1'
    });
    setItemEditando(null);
    // Limpar erros relacionados aos campos do item
    setErrors({
      bitola: false,
      valorUnitario: false,
      especieId: false
    });
  };
  
  // Validação de campos do item
  const validateItemFields = () => {
    let valido = true;
    const newErrors = { ...errors };
    
    // Validar bitola (espessura)
    const bitola = parseFloat(currentItem.bitola);
    if (isNaN(bitola) || bitola <= 0) {
      newErrors.bitola = true;
      valido = false;
    }
    
    // Validar valor unitário
    if (formData.valorUnitario <= 0) {
      newErrors.valorUnitario = true;
      valido = false;
    }
    
    // Validar espécie
    if (!currentItem.especieId) {
      newErrors.especieId = true;
      valido = false;
    }
    
    // Atualizar erros
    setErrors(newErrors);
    
    // Validar largura
    if (!currentItem.largura || parseFloat(currentItem.largura) <= 0) {
      alert('A largura deve ser maior que zero');
      return false;
    }
    
    // Validar comprimento
    if (!currentItem.comprimento || parseFloat(currentItem.comprimento) <= 0) {
      alert('O comprimento deve ser maior que zero');
      return false;
    }
    
    // Validar quantidade
    if (!currentItem.quantidade || parseInt(currentItem.quantidade) <= 0) {
      alert('A quantidade deve ser maior que zero');
      return false;
    }
    
    // Validar espécie novamente (redundante, mas mantém consistência com os alertas)
    if (!currentItem.especieId) {
      alert('Por favor, selecione uma espécie para o item');
      return false;
    }
    
    return valido;
  };
  
  // Função para excluir item
  const excluirItem = (id: number) => {
    console.log(`Excluindo item com ID: ${id}`);
    console.log('Lista de itens antes da exclusão:', formData.itens);
    
    // Encontrar o item para mostrar informações
    const itemParaExcluir = formData.itens.find(item => item.id === id);
    if (itemParaExcluir) {
      console.log('Item a ser excluído:', itemParaExcluir);
    }
    
    // Filtrar a lista de itens, removendo o item com o ID especificado
    const novosItens = formData.itens.filter(item => item.id !== id);
    
    console.log('Lista de itens após exclusão:', novosItens);
    console.log(`Total de itens antes: ${formData.itens.length}, após: ${novosItens.length}`);
    
    // Verificar se existem itens sem espécieId após a exclusão
    const itensSemEspecie = novosItens.filter(item => !item.especieId);
    if (itensSemEspecie.length > 0) {
      console.log('Itens sem espécie após exclusão:', itensSemEspecie);
      
      // Tentar corrigir atribuindo a espécie do primeiro item que tem espécie
      const itemComEspecie = novosItens.find(item => item.especieId);
      if (itemComEspecie) {
        console.log('Item com espécie encontrado para usar como referência:', itemComEspecie);
        
        const itensCorrigidos = novosItens.map(item => {
          if (!item.especieId) {
            return {
              ...item,
              especieId: itemComEspecie.especieId,
              especieNome: itemComEspecie.especieNome
            };
          }
          return item;
        });
        
        console.log('Itens corrigidos após exclusão:', itensCorrigidos);
        
        // Atualizar o estado com a nova lista de itens corrigidos
        setFormData({
          ...formData,
          itens: itensCorrigidos
        });
      } else {
        // Se não houver item com espécie, tentar usar a espécie do formulário
        console.log('Nenhum item com espécie encontrado. Tentando usar espécie do formulário:', formData.especie);
        
        if (formData.especie) {
          const especieSelecionada = especies.find(e => e.id === formData.especie);
          const especieNome = especieSelecionada?.nome || formData.especieNome || '';
          
          const itensCorrigidos = novosItens.map(item => {
            if (!item.especieId) {
              return {
                ...item,
                especieId: formData.especie,
                especieNome
              };
            }
            return item;
          });
          
          console.log('Itens corrigidos com espécie do formulário:', itensCorrigidos);
          
          // Atualizar o estado com a nova lista de itens corrigidos
          setFormData({
            ...formData,
            itens: itensCorrigidos
          });
        } else {
          // Se não houver espécie no formulário, apenas atualizar com os itens filtrados
          console.log('Sem espécie disponível para correção. Atualizando apenas com itens filtrados.');
          setFormData({
            ...formData,
            itens: novosItens
          });
        }
      }
    } else {
      // Não há itens sem espécie, apenas atualizar o estado com a nova lista de itens
      console.log('Todos os itens têm espécie, atualizando lista normalmente.');
      setFormData({
        ...formData,
        itens: novosItens
      });
    }
    
    // Ajustar a página atual se necessário após a remoção
    const novoTotalPaginas = Math.ceil(novosItens.length / ITENS_POR_PAGINA);
    if (paginaAtual > novoTotalPaginas && novoTotalPaginas > 0) {
      setPaginaAtual(novoTotalPaginas);
    }
  };
  
  // Função para formatar valores
  const formatarBitola = (value: number) => {
    if (value === undefined || value === null) {
      return "0,0 cm";
    }
    return `${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })} cm`;
  };
  
  const formatarMedida = (value: number) => {
    if (value === undefined || value === null) {
      return "0 cm";
    }
    return `${value} cm`;
  };
  
  // Função para mostrar lista de romaneios
  const mostrarListaRomaneios = async () => {
    try {
      console.log('Iniciando busca de romaneios do tipo TL...');
      
      // Primeiro, buscar todos os romaneios para debug
      const todosRomaneios = await romaneiosService.getAll();
      console.log('Todos os romaneios disponíveis:', todosRomaneios);
      
      // Usar o método específico para buscar romaneios por tipo
      // Este método filtra apenas os romaneios com tipo 'TL' (case insensitive)
      const romaneiosTL = await romaneiosService.getByTipo('TL');
      
      console.log('Total de romaneios TL encontrados:', romaneiosTL.length);
      
      // Verificação adicional para garantir que apenas romaneios TL foram retornados
      const verificacaoTipos = romaneiosTL.every(r => r.tipo && r.tipo.toLowerCase() === 'tl');
      console.log('Todos os romaneios filtrados são do tipo TL:', verificacaoTipos);
      
      // Ordenar os romaneios por data em ordem decrescente (mais recente primeiro)
      const romaneiosOrdenados = [...romaneiosTL].sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
      
      setRomaneiosLista(romaneiosOrdenados);
      setPaginaListaAtual(1); // Reinicia a paginação quando abrir a lista
      setModalListaAberto(true);
    } catch (error) {
      console.error('Erro ao carregar romaneios:', error);
      alert('Erro ao carregar romaneios. Tente novamente.');
    }
  };
  
  // Função para editar um romaneio
  const editarRomaneio = (id: string) => {
    const romaneio = romaneiosLista.find(r => r.id === id);
    if (!romaneio) {
      console.error('Romaneio não encontrado:', id);
      alert('Romaneio não encontrado.');
      return;
    }
    
    console.log('Editando romaneio:', romaneio);
    console.log('Espécie do romaneio:', romaneio.especie, romaneio.especieNome);
    console.log('Itens originais do romaneio:', romaneio.itens);
    
    // Limpa o formulário existente primeiro para evitar mistura de dados
    setFormData({
      cliente: '',
      especie: '',
      data: new Date().toISOString().split('T')[0],
      valorUnitario: 0,
      itens: []
    });
    
    // Verificar se os itens têm especieId, caso contrário, adicionar baseado na espécie do romaneio
    const itensProcessados = Array.isArray(romaneio.itens) ? romaneio.itens.map((item: any, index: number) => {
      // Se o item não tem especieId mas o romaneio tem espécie definida, usar essa
      const especieId = item.especieId || romaneio.especie || '';
      
      // Buscar o nome da espécie se não estiver no item
      let especieNome = item.especieNome || '';
      if (especieId && !especieNome) {
        const especieEncontrada = especies.find(e => e.id === especieId);
        if (especieEncontrada) {
          especieNome = especieEncontrada.nome;
        } else if (romaneio.especieNome) {
          especieNome = romaneio.especieNome;
        }
      }
      
      console.log(`Item ${index} processado:`, {
        id: item.id || Date.now() + Math.random(),
        bitola: item.bitola || item.espessura || 0,
        largura: item.largura || 0,
        comprimento: item.comprimento || 0,
        quantidade: item.quantidade || 0,
        volume: item.volume || 0,
        valorUnitario: romaneio.preco || 0,
        valorTotal: (item.volume || 0) * (romaneio.preco || 0),
        especieId,
        especieNome
      });
      
      return {
        id: item.id || Date.now() + Math.random(), // Usar ID existente ou gerar novo
        bitola: item.bitola || item.espessura || 0, // Usar bitola ou espessura se disponível
        largura: item.largura || 0,
        comprimento: item.comprimento || 0,
        quantidade: item.quantidade || 0,
        volume: item.volume || 0,
        valorUnitario: romaneio.preco || 0,
        valorTotal: (item.volume || 0) * (romaneio.preco || 0),
        especieId,
        especieNome
      };
    }) : [];
    
    // Verificar se todos os itens têm um especieId
    const todosItemsTemEspecie = itensProcessados.every((item: any) => !!item.especieId);
    console.log('Todos os itens têm especieId?', todosItemsTemEspecie);
    
    // Preparar dados para edição
    const dadosParaEdicao: RomaneioForm = {
      cliente: romaneio.cliente || '',
      clienteNome: romaneio.clienteNome || '',
      especie: romaneio.especie || '',
      especieNome: romaneio.especieNome || '',
      data: new Date(romaneio.data).toISOString().split('T')[0],
      valorUnitario: romaneio.preco || 0,
      itens: itensProcessados
    };
    
    console.log('Dados preparados para edição:', dadosParaEdicao);
    
    // Adicionar parâmetro de consulta para indicar modo de edição
    const url = new URL(window.location.href);
    url.searchParams.set('editar', 'true');
    window.history.pushState({}, '', url);
    
    // Salvar no localStorage para persistir durante edição
    localStorage.setItem('romaneioTLEmEdicao', JSON.stringify({
      ...dadosParaEdicao,
      id: romaneio.id, // Manter o ID original para atualização posterior
      index: romaneiosLista.findIndex(r => r.id === id)
    }));
    
    // Atualizar o formulário
    setFormData(dadosParaEdicao);
    setEditandoRomaneioIndex(romaneiosLista.findIndex(r => r.id === id));
    
    // Resetar o currentItem
    setCurrentItem({
      bitola: '',
      largura: '',
      comprimento: '',
      quantidade: '1',
      especieId: ''
    });
    
    // Definir a página para 1 para garantir que o usuário veja os itens
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
        
        // Atualiza a lista de romaneios
        const todosRomaneios = await romaneiosService.getAll();
        const romaneiosTL = todosRomaneios.filter(romaneio => {
          const tipoLowerCase = romaneio.tipo ? romaneio.tipo.toLowerCase() : '';
          return tipoLowerCase === 'tl';
        });
        
        console.log('Romaneios restantes após exclusão:', romaneiosTL);
        setRomaneiosLista(romaneiosTL);
        
        alert('Romaneio excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir romaneio:', error);
        alert('Erro ao excluir romaneio. Tente novamente.');
      }
    }
  };
  
  // Corrigir a função salvarRomaneio para incluir empresaId
  const salvarRomaneio = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (salvarEmProgresso.current) {
      console.log('Salvamento já em progresso, aguardando...');
      return;
    }
    
    try {
      salvarEmProgresso.current = true;
      
      if (!formData.cliente) {
        alert('Por favor, selecione um cliente');
        return;
      }
      
      if (formData.itens.length === 0) {
        alert('Adicione pelo menos um item ao romaneio');
        return;
      }
      
      // Verificar se todos os itens têm espécie e corrigir de uma vez se necessário
      const itensSemEspecie = formData.itens.filter(item => !item.especieId);
      
      if (itensSemEspecie.length > 0) {
        console.log("Itens sem espécie detectados:", itensSemEspecie.length);
        
        // Determinar qual espécie usar para corrigir os itens
        let especieIdParaCorrecao = '';
        let especieNomeParaCorrecao = '';
        
        // Verificar se há itens com espécie no formulário atual
        const itemComEspecie = formData.itens.find(item => item.especieId);
        if (itemComEspecie && itemComEspecie.especieId) {
          especieIdParaCorrecao = itemComEspecie.especieId;
          especieNomeParaCorrecao = itemComEspecie.especieNome || '';
          console.log("Usando espécie de um item existente:", especieIdParaCorrecao);
        }
        // Verificar se algum item tem nome de espécie mas não ID
        else if (itensSemEspecie.some(item => item.especieNome)) {
          const itemComNome = itensSemEspecie.find(item => item.especieNome);
          if (itemComNome) {
            const especiePorNome = especies.find(e => e.nome === itemComNome.especieNome);
            if (especiePorNome) {
              especieIdParaCorrecao = especiePorNome.id;
              especieNomeParaCorrecao = especiePorNome.nome;
              console.log("Espécie encontrada pelo nome:", especieIdParaCorrecao);
            }
          }
        }
        // Verificar se estamos em modo de edição e recuperar dados do localStorage
        else if (editandoRomaneioIndex !== null) {
          const romaneioEmEdicao = localStorage.getItem('romaneioTLEmEdicao');
          if (romaneioEmEdicao) {
            try {
              const dados = JSON.parse(romaneioEmEdicao);
              
              // Tentar obter espécie do romaneio em edição
              if (dados.especie) {
                especieIdParaCorrecao = dados.especie;
                especieNomeParaCorrecao = dados.especieNome || '';
                console.log("Usando espécie do romaneio em edição:", especieIdParaCorrecao);
              }
              // Ou tentar obter de algum item do romaneio
              else {
                const itemComEspecieNoRomaneio = dados.itens?.find((item: any) => item.especieId);
                if (itemComEspecieNoRomaneio) {
                  especieIdParaCorrecao = itemComEspecieNoRomaneio.especieId;
                  especieNomeParaCorrecao = itemComEspecieNoRomaneio.especieNome || '';
                  console.log("Usando espécie de um item do romaneio:", especieIdParaCorrecao);
                }
              }
            } catch (err) {
              console.error('Erro ao processar dados para correção de espécies:', err);
            }
          }
        }
        
        // Se não encontrou uma espécie para correção, alertar o usuário
        if (!especieIdParaCorrecao) {
          alert('Todos os itens devem ter uma espécie selecionada');
          return;
        }
        
        // Corrigir todos os itens sem espécie de uma vez
        const itensCorrigidos = formData.itens.map(item => {
          if (!item.especieId) {
            return {
              ...item,
              especieId: especieIdParaCorrecao,
              especieNome: especieNomeParaCorrecao
            };
          }
          return item;
        });
        
        // Atualizar o formulário com os itens corrigidos
        setFormData(prev => ({
          ...prev,
          itens: itensCorrigidos
        }));
        
        console.log("Itens corrigidos com espécie:", itensCorrigidos.length);
      }
      
      // Continuar com o processo de salvamento
      
      setLoading(true);
      
      // Obter ID da empresa atual do localStorage
      const empresaId = localStorage.getItem('empresaId') || '1';
      
      const volumeTotal = formData.itens.reduce((total, item) => total + item.volume, 0);
      
      const clienteSelecionado = clientes.find(c => c.id === formData.cliente);
      // Usar a espécie do primeiro item com especieId como espécie padrão, se existir
      const primeiroItemComEspecie = formData.itens.find(item => item.especieId);
      const especieId = primeiroItemComEspecie?.especieId || '';
      const especieSelecionada = especieId ? especies.find(e => e.id === especieId) : null;
      
      console.log('Espécie principal selecionada:', especieId, especieSelecionada?.nome);
      
      // Adicionar números para cada item e garantir que todos tenham especieId
      const itensMapeados = formData.itens.map((item, index) => {
        // Garantir que todos os itens têm o especieId correto
        if (!item.especieId && especieId) {
          console.log(`Atribuindo espécie ${especieId} ao item ${index}`);
          item.especieId = especieId;
          item.especieNome = especieSelecionada?.nome || '';
        }
        
        return {
          ...item,
          numero: index + 1,
          especieId: item.especieId || especieId || '', // Garantir que todos tenham especieId
          especieNome: item.especieNome || especieSelecionada?.nome || ''
        };
      });
      
      console.log('Itens preparados para salvamento:', itensMapeados.length);
      
      // Verificar mais uma vez se todos os itens têm especieId
      const itemSemEspecie = itensMapeados.find(item => !item.especieId);
      if (itemSemEspecie) {
        console.error('Ainda existem itens sem espécie:', itemSemEspecie);
        alert('Erro: Ainda existem itens sem espécie. Por favor, selecione uma espécie para cada item.');
        return;
      }
      
      // Calcular o valor total de forma explícita
      const valorTotal = formData.itens.reduce((total, item) => total + item.valorTotal, 0);
      
      // Garantir que temos uma espécie principal válida
      let especiePrincipal = '';
      let especiePrincipalNome = '';

      // Prioridade 1: Usar a espécie do primeiro item com especieId
      const itemComEspecie = formData.itens.find(item => item.especieId);
      if (itemComEspecie && itemComEspecie.especieId) {
        especiePrincipal = itemComEspecie.especieId;
        // Garantir que temos o nome da espécie
        if (itemComEspecie.especieNome) {
          especiePrincipalNome = itemComEspecie.especieNome;
        } else {
          // Buscar o nome da espécie pelo ID
          const especie = especies.find(e => e.id === especiePrincipal);
          if (especie) {
            especiePrincipalNome = especie.nome;
          }
        }
        console.log(`Espécie principal definida a partir do primeiro item: ${especiePrincipal} (${especiePrincipalNome})`);
      }

      const romaneioData = {
        tipo: 'TL',
        cliente: formData.cliente,
        clienteNome: clienteSelecionado?.nome || '',
        especie: especiePrincipal,
        especieNome: especiePrincipalNome,
        data: new Date(formData.data),
        dataCriacao: new Date(),
        empresaId: localStorage.getItem('empresaId') || '1',
        numero: `TL-${Date.now().toString().substring(8)}`,
        itens: itensMapeados.map((item, index) => ({
          numero: index + 1,
          largura: item.largura,
          comprimento: item.comprimento,
          espessura: item.bitola,
          bitola: item.bitola,
          quantidade: item.quantidade,
          especieId: item.especieId || especiePrincipal || '',
          especieNome: item.especieNome || especiePrincipalNome || '',
          volume: item.volume,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal
        })),
        volumeTotal,
        preco: formData.valorUnitario,
        valorTotal
      };
      
      console.log('Dados do romaneio a serem salvos:', romaneioData);
      console.log('Espécie principal gravada:', romaneioData.especie, romaneioData.especieNome);
      
      // Variável para armazenar se estávamos no modo de edição antes de salvar
      const estavamosEditando = editandoRomaneioIndex !== null;
      let romaneioId = '';
      
      // Se estiver editando um romaneio existente
      if (estavamosEditando) {
        // Recuperar o ID do romaneio em edição
        const romaneioEmEdicao = localStorage.getItem('romaneioTLEmEdicao');
        if (romaneioEmEdicao) {
          const { id } = JSON.parse(romaneioEmEdicao);
          romaneioId = id;
          console.log('Atualizando romaneio ID:', id);
          console.log('Itens atualizados:', romaneioData.itens);
          
          await romaneiosService.update(id, romaneioData);
          console.log('Romaneio atualizado com sucesso!');
          
          // Verificar se a atualização foi bem-sucedida
          const romaneioAtualizado = await romaneiosService.getById(id);
          console.log('Romaneio após atualização:', romaneioAtualizado);
          
          if (romaneioAtualizado && romaneioAtualizado.itens) {
            console.log('Itens após atualização:', romaneioAtualizado.itens.length);
            
            // Verificar na lista completa se a atualização foi aplicada
            const todosRomaneios = await romaneiosService.getAll();
            const romaneioNaLista = todosRomaneios.find(r => r.id === id);
            if (romaneioNaLista) {
              console.log('Romaneio na lista completa após atualização:', romaneioNaLista);
              console.log('Itens na lista completa após atualização:', romaneioNaLista.itens.length);
            }
          }
          
          alert('Romaneio atualizado com sucesso!');
          
          // Forçar recarga completa da página após atualização
          localStorage.removeItem('romaneioTLEmEdicao');
          console.log('Recarregando página para refletir alterações...');
          
          // Usar um timeout mais longo para garantir que as alterações sejam salvas
          setTimeout(() => {
            // Forçar recarga completa sem usar cache
            window.location.reload();
          }, 1000);
          
          return; // Sair da função para evitar processamento adicional
        } else {
          alert('Erro: Não foi possível recuperar o ID do romaneio em edição');
          return;
        }
      } else {
        // Cria um novo romaneio
        console.log('Criando novo romaneio:', romaneioData);
        romaneioId = await romaneiosService.create(romaneioData);
        console.log('Romaneio salvo com sucesso! ID:', romaneioId);
        alert('Romaneio salvo com sucesso!');
      }
      
      // Força a atualização da lista de romaneios após salvar/editar
      await atualizarListaRomaneios();
      
      // Limpa o localStorage e remove parâmetro de URL
      localStorage.removeItem('romaneioTLEmEdicao');
      const url = new URL(window.location.href);
      url.searchParams.delete('editar');
      window.history.pushState({}, '', url);
      console.log('LocalStorage limpo');
      
      // Se não estamos editando, apenas limpar o formulário
      if (!estavamosEditando) {
        // Reseta o formulário de forma explícita para garantir limpeza
        console.log('Limpando formulário...');
        setFormData({
          cliente: '',
          especie: '',
          data: new Date().toISOString().split('T')[0],
          valorUnitario: 0,
          itens: []
        });
        
        // Reseta o item atual
        setCurrentItem({
          bitola: '',
          largura: '',
          comprimento: '',
          quantidade: '1',
          especieId: ''
        });
        
        // Reseta explicitamente o índice do romaneio em edição
        setEditandoRomaneioIndex(null);
        
        // Define a página atual para 1 quando limpar a tabela
        setPaginaAtual(1);
      }
      
      console.log('Modo de edição encerrado, formulário limpo, voltando ao estado inicial');
    } catch (error) {
      console.error('Erro ao salvar romaneio:', error);
      alert('Erro ao salvar romaneio. Tente novamente.');
    } finally {
      salvarEmProgresso.current = false;
      setLoading(false); // Garantir que o estado de loading seja sempre removido
    }
  };
  
  // Função para forçar a atualização da lista de romaneios
  const atualizarListaRomaneios = async () => {
    try {
      console.log('Atualizando lista de romaneios...');
      const todosRomaneios = await romaneiosService.getAll();
      console.log('Todos os romaneios após atualização:', todosRomaneios);
      
      const romaneiosTL = await romaneiosService.getByTipo('TL');
      console.log('Romaneios TL atualizados:', romaneiosTL);
      
      setRomaneiosLista(romaneiosTL);
      
      // Se o modal estiver aberto, mantém a lista atualizada
      if (modalListaAberto) {
        console.log('Modal aberto, atualizando lista exibida');
      } else {
        console.log('Lista de romaneios atualizada em segundo plano');
      }
      
      return romaneiosTL;
    } catch (error) {
      console.error('Erro ao atualizar lista de romaneios:', error);
      return [];
    }
  };
  
  // Funções para paginação
  const totalPaginas = Math.ceil(formData.itens.length / ITENS_POR_PAGINA);
  
  // Inverter a ordem dos itens para que o último adicionado apareça primeiro
  const itensInvertidos = [...formData.itens].reverse();
  
  const itensAtual = itensInvertidos
    .slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);
  
  // Calcular totais
  const totalItens = formData.itens.reduce((total, item) => total + item.quantidade, 0);
  const volumeTotal = formData.itens.reduce((total, item) => total + item.volume, 0);
  const valorTotal = formData.itens.reduce((total, item) => total + item.valorTotal, 0);
  
  // Função para navegar com a tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (nextFieldId === 'adicionar') {
        // Aciona o botão de adicionar item
        adicionarItem();
        
        // Após adicionar, move o foco para o campo de bitola (espessura)
        const bitolaInput = document.getElementById('bitola');
        if (bitolaInput) {
          bitolaInput.focus();
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
  
  // Modificar a função gerarResumo para incluir o resumo por bitola
  const gerarResumo = (itens: Item[]) => {
    // Código existente do resumo por espécie
    const resumoPorEspecie = itens.reduce((acc, item) => {
      const especieNome = item.especieNome || 'Sem Espécie';
      const dimensaoKey = `${item.bitola}x${item.largura}`;
      
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
      const tipoProduto = identificarProduto(item.bitola, item.largura);
      
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
        title="Romaneio Toda Largura"
        description="Registre romaneios de madeira serrada Toda Largura."
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
                  value={formData.valorUnitario ? formatarMoeda(formData.valorUnitario) : ''}
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
            <FormRow>
              <FormGroup>
                <Label htmlFor="bitola">Espessura (cm):</Label>
                <Input
                  type="number"
                  id="bitola"
                  name="bitola"
                  value={currentItem.bitola}
                  onChange={handleItemChange}
                  step="0.1"
                  min="0"
                  className={errors.bitola ? 'error' : ''}
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'comprimento')}
                />
                {errors.bitola && <ErrorText>Digite uma espessura válida</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="comprimento">Comprimento (cm):</Label>
                <Input
                  type="number"
                  id="comprimento"
                  name="comprimento"
                  value={currentItem.comprimento}
                  onChange={handleItemChange}
                  step="0.1"
                  min="0"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'largura')}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="largura">Largura (cm):</Label>
                <Input
                  type="number"
                  id="largura"
                  name="largura"
                  value={currentItem.largura}
                  onChange={handleItemChange}
                  step="0.1"
                  min="0"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'quantidade')}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="quantidade">Quantidade:</Label>
                <Input
                  type="number"
                  id="quantidade"
                  name="quantidade"
                  value={currentItem.quantidade}
                  onChange={handleItemChange}
                  min="1"
                  required
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, 'especieId')}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="especieId">Espécie do Item:</Label>
                <Select
                  id="especieId"
                  name="especieId"
                  value={currentItem.especieId}
                  onChange={handleItemChange}
                  className={errors.especieId ? 'error' : ''}
                  required
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
                  <TableHeader>Comprimento</TableHeader>
                  <TableHeader>Largura</TableHeader>
                  <TableHeader>Espessura</TableHeader>
                  <TableHeader>Quantidade</TableHeader>
                  <TableHeader>Espécie</TableHeader>
                  <TableHeader>Volume (m³)</TableHeader>
                  <TableHeader>Valor</TableHeader>
                  <TableHeader>Ações</TableHeader>
                </tr>
              </thead>
              <tbody>
                {itensAtual.map(item => (
                  <tr key={item.id}>
                    <TableCell>{formatarMedida(item.comprimento)}</TableCell>
                    <TableCell>{formatarMedida(item.largura)}</TableCell>
                    <TableCell>{formatarBitola(item.bitola)}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>
                      {item.especieNome || 
                        (item.especieId ? 
                          especies.find(e => e.id === item.especieId)?.nome || '--' : 
                          '--')}
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
                          onClick={() => excluirItem(item.id)}
                          title="Excluir"
                        >
                          <i className="fas fa-trash"></i>
                        </ActionButton>
                      </ButtonGroup>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
          
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
        </FormSection>

        {/* Totais */}
        <TotalInfo>
          <TotalItem>
            <strong>Total de Items:</strong> <span>{totalItens}</span>
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
              <ModalTitle>Lista de Romaneios TL</ModalTitle>
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
                      {
                        // Calcular os romaneios atuais baseado na paginação
                        (() => {
                          const totalPaginasLista = Math.ceil(romaneiosLista.length / ROMANEIOS_POR_PAGINA);
                          const inicio = (paginaListaAtual - 1) * ROMANEIOS_POR_PAGINA;
                          const fim = inicio + ROMANEIOS_POR_PAGINA;
                          const romaneiosAtuais = romaneiosLista.slice(inicio, fim);
                          
                          return romaneiosAtuais.map(romaneio => {
                            const volumeTotal = romaneio.volumeTotal || 
                              romaneio.itens.reduce((total: number, item: any) => total + (item.volume || 0), 0);
                            const valorTotal = romaneio.valorTotal || 
                              romaneio.itens.reduce((total: number, item: any) => total + (item.valorTotal || 0), 0);
    
                            return (
                              <tr key={romaneio.id}>
                                <TableCell>{romaneio.numero || '---'}</TableCell>
                                <TableCell>{romaneio.clienteNome || '---'}</TableCell>
                                <TableCell>{new Date(romaneio.data).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>{romaneio.especieNome || 
                                  (romaneio.especie ? 
                                    especies.find(e => e.id === romaneio.especie)?.nome || '---' : 
                                    '---')
                                }</TableCell>
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
                                        tipo: 'TL',
                                        itens: romaneio.itens.map((item: any) => ({
                                          ...item,
                                          bitola: item.espessura || item.bitola,
                                          valorUnitario: romaneio.preco || 0,
                                        }))
                                      }}
                                    />
                                  </ButtonGroup>
                                </TableCell>
                              </tr>
                            );
                          });
                        })()
                      }
                    </tbody>
                  </Table>
                  
                  {/* Adicionar paginação se houver mais de uma página */}
                  {romaneiosLista.length > ROMANEIOS_POR_PAGINA && (
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
                      {(() => {
                        const totalPaginasLista = Math.ceil(romaneiosLista.length / ROMANEIOS_POR_PAGINA);
                        
                        return Array.from({ length: totalPaginasLista }, (_, i) => i + 1)
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
                          ));
                      })()}
                      
                      {(() => {
                        const totalPaginasLista = Math.ceil(romaneiosLista.length / ROMANEIOS_POR_PAGINA);
                        
                        return (
                          <>
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
                          </>
                        );
                      })()}
                    </PaginationContainer>
                  )}
                </>
              ) : (
                <p className="empty-message">Nenhum romaneio TL encontrado.</p>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RomaneioTL; 