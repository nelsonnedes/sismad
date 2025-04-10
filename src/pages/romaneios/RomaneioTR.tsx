import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import { collection, getDocs, addDoc, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { calcularVolumeTora, formatarVolume } from '../../utils/madeira';
import PageHeader from '../../components/PageHeader';

// Interfaces
interface Cliente {
  id: string;
  nome: string;
}

interface Especie {
  id: string;
  nome: string;
}

interface ToraItem {
  numero: number;
  diametro1: number;
  diametro2: number;
  comprimento: number;
  volume: number;
}

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.primary};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color ${({ theme }) => theme.transitions.default};

  &:hover {
    background-color: #0b5ed7;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled(Button)`
  background-color: ${({ theme }) => theme.colors.secondary};
  &:hover {
    background-color: #5a6268;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.medium};
  
  th, td {
    padding: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    text-align: left;
  }
  
  th {
    background-color: ${({ theme }) => theme.colors.light};
  }
  
  tr:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.light};
  }
`;

const TotalVolume = styled.div`
  margin-top: ${({ theme }) => theme.spacing.medium};
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.large};
  text-align: right;
`;

const RomaneioTR: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const [especieSelecionada, setEspecieSelecionada] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numero, setNumero] = useState<string>('');
  const [itens, setItens] = useState<ToraItem[]>([]);
  
  // Campos para nova tora
  const [novaTora, setNovaTora] = useState<{
    numero: number;
    diametro1: number;
    diametro2: number;
    comprimento: number;
  }>({
    numero: 1,
    diametro1: 0,
    diametro2: 0,
    comprimento: 0
  });

  // Carrega clientes e espécies do Firestore
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const clientesSnapshot = await getDocs(collection(db, 'clientes'));
        const clientesData = clientesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nome: doc.data().nome
        }));
        setClientes(clientesData);

        const especiesSnapshot = await getDocs(collection(db, 'especies'));
        const especiesData = especiesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          nome: doc.data().nome
        }));
        setEspecies(especiesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar clientes e espécies. Verifique o console para mais detalhes.');
      }
    };

    carregarDados();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaTora({
      ...novaTora,
      [name]: name === 'numero' ? parseInt(value) : parseFloat(value)
    });
  };

  const adicionarTora = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaTora.diametro1 <= 0 || novaTora.diametro2 <= 0 || novaTora.comprimento <= 0) {
      alert('Por favor, preencha todos os campos com valores válidos.');
      return;
    }
    
    const volume = calcularVolumeTora(
      novaTora.diametro1,
      novaTora.diametro2,
      novaTora.comprimento
    );
    
    const novaToraConcompleto: ToraItem = {
      ...novaTora,
      volume
    };
    
    setItens([...itens, novaToraConcompleto]);
    
    // Incrementa o número para a próxima tora
    setNovaTora({
      numero: novaTora.numero + 1,
      diametro1: 0,
      diametro2: 0,
      comprimento: 0
    });
  };

  const removerTora = (index: number) => {
    const novosItens = [...itens];
    novosItens.splice(index, 1);
    setItens(novosItens);
  };

  const calcularVolumeTotal = (): number => {
    return itens.reduce((total, item) => total + item.volume, 0);
  };

  const salvarRomaneio = async () => {
    if (!clienteSelecionado || !especieSelecionada || itens.length === 0) {
      alert('Por favor, selecione cliente, espécie e adicione pelo menos uma tora.');
      return;
    }

    try {
      const romaneioData = {
        tipo: 'TR',
        cliente: clienteSelecionado,
        especie: especieSelecionada,
        data: Timestamp.fromDate(new Date(data)),
        numero: numero,
        itens: itens.map(item => ({
          numero: item.numero,
          diametro1: item.diametro1,
          diametro2: item.diametro2,
          comprimento: item.comprimento,
          volume: item.volume
        })),
        volumeTotal: calcularVolumeTotal(),
        dataCriacao: Timestamp.now()
      };

      await addDoc(collection(db, 'romaneios'), romaneioData);
      alert('Romaneio salvo com sucesso!');
      
      // Limpa o formulário
      setClienteSelecionado('');
      setEspecieSelecionada('');
      setData(new Date().toISOString().split('T')[0]);
      setNumero('');
      setItens([]);
      setNovaTora({
        numero: 1,
        diametro1: 0,
        diametro2: 0,
        comprimento: 0
      });
    } catch (error) {
      console.error('Erro ao salvar romaneio:', error);
      alert('Erro ao salvar romaneio. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Container>
      <PageHeader
        title="Romaneio de Toras"
        description="Cadastre o romaneio de toras com cálculo automático de volume."
      />
      
      <FormCard>
        <SectionTitle>Informações Gerais</SectionTitle>
        <Form onSubmit={adicionarTora}>
          <FormGroup>
            <Label htmlFor="cliente">Cliente</Label>
            <Select 
              id="cliente" 
              value={clienteSelecionado}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setClienteSelecionado(e.target.value)}
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
            <Label htmlFor="especie">Espécie</Label>
            <Select 
              id="especie" 
              value={especieSelecionada}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setEspecieSelecionada(e.target.value)}
              required
            >
              <option value="">Selecione uma espécie</option>
              {especies.map(especie => (
                <option key={especie.id} value={especie.id}>
                  {especie.nome}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="data">Data</Label>
            <Input 
              type="date" 
              id="data" 
              value={data}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setData(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="numero">Número</Label>
            <Input 
              type="text" 
              id="numero" 
              value={numero}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNumero(e.target.value)}
              placeholder="Número do romaneio"
              required
            />
          </FormGroup>
        </Form>
      </FormCard>
      
      <FormCard>
        <SectionTitle>Adicionar Tora</SectionTitle>
        <Form onSubmit={adicionarTora}>
          <FormGroup>
            <Label htmlFor="numero">Número</Label>
            <Input 
              type="number" 
              id="numero" 
              name="numero" 
              value={novaTora.numero}
              onChange={handleInputChange}
              required
              readOnly
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="diametro1">Diâmetro 1 (cm)</Label>
            <Input 
              type="number" 
              id="diametro1" 
              name="diametro1" 
              value={novaTora.diametro1 || ''}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="diametro2">Diâmetro 2 (cm)</Label>
            <Input 
              type="number" 
              id="diametro2" 
              name="diametro2" 
              value={novaTora.diametro2 || ''}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="comprimento">Comprimento (m)</Label>
            <Input 
              type="number" 
              id="comprimento" 
              name="comprimento" 
              value={novaTora.comprimento || ''}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              required
            />
          </FormGroup>
          
          <Button type="submit">Adicionar Tora</Button>
        </Form>
      </FormCard>
      
      {itens.length > 0 && (
        <FormCard>
          <SectionTitle>Toras Adicionadas</SectionTitle>
          <Table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Diâmetro 1 (cm)</th>
                <th>Diâmetro 2 (cm)</th>
                <th>Comprimento (m)</th>
                <th>Volume (m³)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr key={index}>
                  <td>{item.numero}</td>
                  <td>{item.diametro1}</td>
                  <td>{item.diametro2}</td>
                  <td>{item.comprimento}</td>
                  <td>{formatarVolume(item.volume)}</td>
                  <td>
                    <ButtonSecondary 
                      type="button" 
                      onClick={() => removerTora(index)}
                    >
                      Remover
                    </ButtonSecondary>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <TotalVolume>
            Volume Total: {formatarVolume(calcularVolumeTotal())} m³
          </TotalVolume>
          
          <Button 
            type="button" 
            onClick={salvarRomaneio}
            style={{ marginTop: '16px' }}
          >
            Salvar Romaneio
          </Button>
        </FormCard>
      )}
    </Container>
  );
};

export default RomaneioTR; 