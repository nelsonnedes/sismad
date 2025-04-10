import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { calcularVolumePacote, formatarVolume, formatarMoeda } from '../../utils/madeira';
import { clientesService, especiesService, romaneiosService, Cliente, Especie } from '../../services/firebaseService';
import { ThemeType } from '../../styles/theme';
import PrintRomaneioButton from '../../components/romaneios/PrintRomaneioButton';
import { Romaneio } from '../../components/romaneios/PrintRomaneio';

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

// Componentes estilizados
const Container = styled.div`
  padding: 0;
`;

const FormContainer = styled.form`
  background-color: #ffffff;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: ${(props: StyledProps) => props.theme.spacing.large};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.large};
`;

const PageHeader = styled.div`
  background-color: ${(props: StyledProps) => props.theme.colors.primary};
  padding: 25px 30px;
  color: white;
  border-radius: 0;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: white;
  font-weight: 500;
`;

const Description = styled.p`
  opacity: 0.8;
  margin: 0;
`;

const FormSection = styled.div`
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.large};
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: ${(props: StyledProps) => props.theme.borderRadius.small};
  border-left: 4px solid ${(props: StyledProps) => props.theme.colors.primary};
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: ${(props: StyledProps) => props.theme.colors.primary};
  margin-bottom: ${(props: StyledProps) => props.theme.spacing.medium};
  padding-bottom: 10px;
  border-bottom: 1px solid ${(props: StyledProps) => props.theme.colors.border};
  font-weight: 500;
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

// Constantes
const ITENS_POR_PAGINA = 10;

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
    quantidade: '1',
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
      alert('Por favor, preencha todos os campos corretamente');
      return;
    }
    
    if (!currentItem.especieId) {
      alert('Por favor, selecione uma espécie para o item');
      return;
    }
    
    const espessura = parseFloat(currentItem.espessura);
    const largura = parseFloat(currentItem.largura);
    const comprimento = parseFloat(currentItem.comprimento);
    const pecasPorPacote = parseInt(currentItem.pecasPorPacote) || 1;
    const quantidade = parseInt(currentItem.quantidade) || 1;
    
    // Se algum valor não for válido, não adiciona o item
    if (
      isNaN(espessura) || isNaN(largura) || isNaN(comprimento) || 
      isNaN(pecasPorPacote) || isNaN(quantidade) ||
      espessura <= 0 || largura <= 0 || comprimento <= 0 || 
      pecasPorPacote <= 0 || quantidade <= 0
    ) {
      alert('Por favor, preencha todos os campos com valores válidos.');
      return;
    }
    
    // Calculando volume (todas as dimensões em centímetros)
    const volume = calcularVolumePacote(
      espessura,
      largura,
      comprimento,
      pecasPorPacote,
      quantidade
    );
    
    // Calculando valor
    const valorTotal = volume * formData.valorUnitario;
    
    // Definindo a espécie do item (se for específica)
    let especieItemId = currentItem.especieId;
    let especieItemNome = '';
    
    if (especieItemId) {
      const especieItem = especies.find(e => e.id === especieItemId);
      especieItemNome = especieItem?.nome || '';
    }
    
    // Verificando se já existe um item com as mesmas características
    const itemExistente = formData.itens.find(item => 
      item.espessura === espessura && 
      item.largura === largura && 
      item.comprimento === comprimento &&
      item.pecasPorPacote === pecasPorPacote &&
      item.especieId === especieItemId
    );
    
    if (itemExistente) {
      // Atualiza a quantidade do item existente
      const novosItens = formData.itens.map(item => {
        if (
          item.espessura === espessura && 
          item.largura === largura && 
          item.comprimento === comprimento &&
          item.pecasPorPacote === pecasPorPacote &&
          item.especieId === especieItemId
        ) {
          const novaQuantidade = item.quantidade + quantidade;
          const novoVolume = calcularVolumePacote(
            item.espessura,
            item.largura,
            item.comprimento,
            item.pecasPorPacote,
            novaQuantidade
          );
          return {
            ...item,
            quantidade: novaQuantidade,
            volume: novoVolume,
            valorTotal: novoVolume * formData.valorUnitario
          };
        }
        return item;
      });
      
      setFormData(prev => ({
        ...prev,
        itens: novosItens
      }));
    } else {
      // Adiciona um novo item
      const novoItem: PacoteItem = {
        id: Date.now(),
        espessura,
        largura,
        comprimento, // Armazenar o comprimento em centímetros
        pecasPorPacote,
        quantidade,
        especieId: especieItemId || undefined,
        especieNome: especieItemNome || undefined,
        volume,
        valorUnitario: formData.valorUnitario,
        valorTotal
      };
      
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, novoItem]
      }));
    }
    
    // Limpa o formulário do item exceto espessura, largura, pecasPorPacote e especieId
    setCurrentItem(prev => ({
      ...prev,
      comprimento: '',
      quantidade: '1'
    }));
    
    // Atualiza a página atual para mostrar o novo item adicionado
    const totalPaginas = Math.ceil((formData.itens.length + 1) / ITENS_POR_PAGINA);
    setPaginaAtual(totalPaginas);
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
        const volume = calcularVolumePacote(
          item.espessura,
          item.largura,
          item.comprimento,
          item.pecasPorPacote,
          item.quantidade
        );
        
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
        valorTotal
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
        quantidade: '1',
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
      
      // Exibir alerta com o total de romaneios encontrados
      alert(`Foram encontrados ${romaneiosPC.length} romaneios do tipo PC.`);
      
      setRomaneiosLista(romaneiosPC);
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
      quantidade: '1',
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
  
  // Funções para paginação
  const totalPaginas = Math.ceil(formData.itens.length / ITENS_POR_PAGINA);
  
  const itensAtual = formData.itens
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
  
  if (loading) {
    return <Container>Carregando dados...</Container>;
  }
  
  return (
    <Container>
      <PageHeader>
        <Title>Romaneio PC</Title>
        <Description>
          Cadastro de romaneio para madeiras em pacotes, com cálculo automático de volume.
        </Description>
      </PageHeader>

      <FormContainer>
        {/* Seleção de cliente e espécie padrão */}
        <FormSection>
          <SectionTitle>Informações Gerais</SectionTitle>
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
        </FormSection>

        {/* Dados do produto */}
        <FormSection>
          <SectionTitle>Dados do Produto</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="valorUnitario">Preço por m³:</Label>
              <Input
                type="text"
                id="valorUnitario"
                name="valorUnitario"
                value={formatValorInput(formData.valorUnitario)}
                onChange={handleInputChange}
                required
                className={errors.valorUnitario ? 'error' : ''}
              />
              {errors.valorUnitario && <ErrorText>Digite um preço válido</ErrorText>}
            </FormGroup>
          </FormRow>
        </FormSection>

        {/* Formulário para adicionar itens */}
        <FormSection>
          <SectionTitle>Itens do Romaneio</SectionTitle>
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
              <i className="fas fa-plus"></i> Adicionar Item
            </AddButton>
            <SaveButton type="button" onClick={salvarRomaneio}>
              <i className="fas fa-save"></i> {editandoRomaneioIndex !== null ? 'Atualizar Romaneio' : 'Salvar Romaneio'}
            </SaveButton>
            <ListButton type="button" onClick={mostrarListaRomaneios}>
              <i className="fas fa-list"></i> Listar Romaneios
            </ListButton>
          </ButtonsContainer>
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
                      <TableCell>{formatarMedida(item.comprimento * 100)}</TableCell>
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
                            className="delete-button" 
                            onClick={() => removerItem(item.id)}
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
      </FormContainer>

      {/* Modal para listagem de romaneios */}
      {modalListaAberto && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={() => setModalListaAberto(false)}>&times;</CloseButton>
            <SectionTitle>Lista de Romaneios</SectionTitle>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Data</TableHeader>
                    <TableHeader>Cliente</TableHeader>
                    <TableHeader>Espécie</TableHeader>
                    <TableHeader>Volume Total</TableHeader>
                    <TableHeader>Valor Total</TableHeader>
                    <TableHeader>Ações</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {romaneiosLista.map((romaneio, index) => {
                    const volumeTotal = romaneio.volumeTotal || 
                      (romaneio.itens ? 
                        romaneio.itens.reduce((sum: number, item: any) => sum + item.volume, 0) : 0);
                    
                    const valorTotal = romaneio.valorTotal || 
                      (romaneio.itens && romaneio.preco ? 
                        volumeTotal * romaneio.preco : 0);
                    
                    return (
                      <tr key={romaneio.id}>
                        <TableCell>
                          {new Date(romaneio.data).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{romaneio.clienteNome}</TableCell>
                        <TableCell>
                          {romaneio.itens && romaneio.itens.length > 0 && romaneio.itens[0].especieNome 
                            ? romaneio.itens[0].especieNome 
                            : romaneio.especieNome || 'Sem espécie'}
                        </TableCell>
                        <TableCell>{formatarVolume(volumeTotal)} m³</TableCell>
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
                              buttonText="Imprimir"
                            />
                          </ButtonGroup>
                        </TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RomaneioPC; 