import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { clientesService, Cliente } from '../../services/firebaseService';
import PageHeader from '../../components/PageHeader';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados quando o componente for montado
  useEffect(() => {
    loadClientes();
  }, []);

  // Função para carregar clientes do Firebase
  const loadClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await clientesService.getAll();
      console.log('Clientes carregados:', data);
      setClientes(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Falha ao carregar os dados de clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditing && editingId) {
        // Atualizar cliente existente
        await clientesService.update(editingId, formData);
        console.log('Cliente atualizado com sucesso!');
        
        // Atualizar a lista em memória
        setClientes(prev => 
          prev.map(cliente => 
            cliente.id === editingId ? { ...formData, id: editingId } : cliente
          )
        );
        
        setIsEditing(false);
        setEditingId('');
      } else {
        // Adicionar novo cliente
        const newId = await clientesService.create(formData);
        console.log('Cliente criado com ID:', newId);
        
        // Adicionar o novo cliente à lista em memória
        setClientes(prev => [...prev, { ...formData, id: newId }]);
      }
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        observacoes: ''
      });
      
      setShowForm(false);
      
      // Recarregar a lista completa para garantir sincronização
      await loadClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Ocorreu um erro ao salvar o cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const clienteToEdit = await clientesService.getById(id);
      
      if (clienteToEdit) {
        setFormData({
          nome: clienteToEdit.nome,
          email: clienteToEdit.email,
          telefone: clienteToEdit.telefone,
          endereco: clienteToEdit.endereco,
          cidade: clienteToEdit.cidade,
          estado: clienteToEdit.estado,
          cep: clienteToEdit.cep,
          observacoes: clienteToEdit.observacoes
        });
        setIsEditing(true);
        setEditingId(id);
        setShowForm(true);
      } else {
        alert('Cliente não encontrado. Pode ter sido removido.');
        await loadClientes(); // Recarregar lista
      }
    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
      alert('Erro ao carregar dados do cliente para edição.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        setLoading(true);
        await clientesService.delete(id);
        console.log('Cliente excluído com sucesso!');
        
        // Atualizar a lista em memória
        setClientes(prev => prev.filter(cliente => cliente.id !== id));
        
        // Recarregar a lista completa para garantir sincronização
        await loadClientes();
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        alert('Ocorreu um erro ao excluir o cliente. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  );

  return (
    <Container>
      <PageHeader 
        title="Cadastro de Clientes"
        description="Gerencie os clientes da madeireira e todas as suas informações."
      />

      {error && (
        <AlertBox>
          <i className="fas fa-exclamation-triangle"></i> {error}
        </AlertBox>
      )}

      <ActionsBar>
        <SearchContainer>
          <SearchIcon className="fas fa-search" />
          <SearchInput 
            type="text" 
            placeholder="Buscar clientes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <AddButton onClick={() => {
          setIsEditing(false);
          setFormData({
            nome: '',
            email: '',
            telefone: '',
            endereco: '',
            cidade: '',
            estado: '',
            cep: '',
            observacoes: ''
          });
          setShowForm(true);
        }} disabled={loading}>
          <i className="fas fa-plus"></i> Novo Cliente
        </AddButton>
      </ActionsBar>

      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Carregando...</LoadingText>
        </LoadingContainer>
      )}

      {!loading && filteredClientes.length === 0 && (
        <EmptyState>
          <i className="fas fa-users"></i>
          <h3>Nenhum cliente encontrado</h3>
          <p>Adicione seu primeiro cliente ou ajuste sua busca.</p>
        </EmptyState>
      )}

      {!loading && filteredClientes.length > 0 && (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Cidade/Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.cidade}/{cliente.estado}</td>
                  <td>
                    <ActionButtons>
                      <ActionButton 
                        onClick={() => handleEdit(cliente.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-edit"></i>
                      </ActionButton>
                      <DeleteButton 
                        onClick={() => handleDelete(cliente.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i>
                      </DeleteButton>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {showForm && (
        <FormCard>
          <FormHeader>
            <h2>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <CloseButton onClick={() => setShowForm(false)} disabled={loading}>
              <i className="fas fa-times"></i>
            </CloseButton>
          </FormHeader>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome do cliente"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email do cliente"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Rua, número"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione...</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="observacoes">Observações</Label>
              <TextArea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Observações sobre este cliente"
              />
            </FormGroup>

            <FormActions>
              <CancelButton 
                type="button" 
                onClick={() => setShowForm(false)}
                disabled={loading}
              >
                Cancelar
              </CancelButton>
              <SubmitButton 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
              </SubmitButton>
            </FormActions>
          </Form>
        </FormCard>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchIcon = styled.i`
  position: absolute;
  left: ${props => props.theme.spacing.small};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.secondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.small};
  padding-left: 35px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const AddButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color ${props => props.theme.transitions.default};
  
  i {
    margin-right: ${props => props.theme.spacing.small};
  }
  
  &:hover {
    background-color: #0b5ed7; // Slightly darker blue
  }
`;

const FormCard = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.medium};
  margin-bottom: ${props => props.theme.spacing.large};
  overflow: hidden;
`;

const FormHeader = styled.div`
  background-color: ${props => props.theme.colors.lightBackground};
  padding: ${props => props.theme.spacing.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  h2 {
    margin: 0;
    color: ${props => props.theme.colors.dark};
    font-size: ${props => props.theme.fontSizes.medium};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.dark};
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    color: ${props => props.theme.colors.danger};
  }
`;

const Form = styled.form`
  padding: ${props => props.theme.spacing.medium};
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -${props => props.theme.spacing.small};
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const FormGroup = styled.div`
  flex: 1;
  min-width: 250px;
  padding: 0 ${props => props.theme.spacing.small};
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.small};
  color: ${props => props.theme.colors.dark};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.small};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.small};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.small};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.medium};
  margin-top: ${props => props.theme.spacing.large};
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius.small};
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: #0b5ed7; // Slightly darker blue
  }
`;

const CancelButton = styled.button`
  background-color: ${props => props.theme.colors.light};
  color: ${props => props.theme.colors.dark};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border-radius: ${props => props.theme.borderRadius.small};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.border};
  }
`;

const TableContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.small};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  .empty-message {
    text-align: center;
    padding: ${props => props.theme.spacing.large};
    color: ${props => props.theme.colors.secondary};
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.lightBackground};
  color: ${props => props.theme.colors.dark};
  font-weight: 600;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TableCell = styled.td`
  padding: ${props => props.theme.spacing.medium};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.small};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.secondary};
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius.small};
  transition: all ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.lightBackground};
    color: ${props => props.theme.colors.primary};
  }
  
  &:last-child:hover {
    color: ${props => props.theme.colors.danger};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.secondary};
  padding: ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius.small};
  transition: all ${props => props.theme.transitions.default};
  
  &:hover {
    background-color: ${props => props.theme.colors.danger};
    color: white;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
  
  i {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 18px;
    color: #666;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #999;
  }
`;

const AlertBox = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #ffeeba;
  display: flex;
  align-items: center;
  
  i {
    margin-right: 8px;
    font-size: 16px;
  }
`;

export default Clientes; 