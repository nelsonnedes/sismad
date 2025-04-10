import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { especiesService, Especie } from '../../services/firebaseService';
import PageHeader from '../../components/PageHeader';

const Especies: React.FC = () => {
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Omit<Especie, 'id'>>({
    nome: '',
    nomeCientifico: '',
    densidade: '',
    categoria: '',
    descricao: '',
    ativo: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categorias = ['Conífera', 'Folhosa', 'Nobre', 'Exótica', 'Tropical', 'Reflorestamento'];

  // Carregar dados quando o componente for montado
  useEffect(() => {
    loadEspecies();
  }, []);

  // Função para carregar espécies do Firebase
  const loadEspecies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await especiesService.getAll();
      console.log('Espécies carregadas:', data);
      setEspecies(data);
    } catch (err) {
      console.error('Erro ao carregar espécies:', err);
      setError('Falha ao carregar os dados de espécies. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Tratar o checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditing && editingId) {
        // Atualizar espécie existente
        await especiesService.update(editingId, formData);
        console.log('Espécie atualizada com sucesso!');
        
        // Atualizar a lista em memória
        setEspecies(prev => 
          prev.map(especie => 
            especie.id === editingId ? { ...formData, id: editingId } : especie
          )
        );
        
        setIsEditing(false);
        setEditingId('');
      } else {
        // Adicionar nova espécie
        const newId = await especiesService.create(formData);
        console.log('Espécie criada com ID:', newId);
        
        // Adicionar a nova espécie à lista em memória
        setEspecies(prev => [...prev, { ...formData, id: newId }]);
      }
      
      // Limpar formulário
      setFormData({
        nome: '',
        nomeCientifico: '',
        densidade: '',
        categoria: '',
        descricao: '',
        ativo: true
      });
      
      setShowForm(false);
      
      // Recarregar a lista completa para garantir sincronização
      await loadEspecies();
    } catch (err) {
      console.error('Erro ao salvar espécie:', err);
      alert('Ocorreu um erro ao salvar a espécie. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setLoading(true);
      const especieToEdit = await especiesService.getById(id);
      
      if (especieToEdit) {
        setFormData({
          nome: especieToEdit.nome,
          nomeCientifico: especieToEdit.nomeCientifico,
          densidade: especieToEdit.densidade,
          categoria: especieToEdit.categoria,
          descricao: especieToEdit.descricao,
          ativo: especieToEdit.ativo
        });
        setIsEditing(true);
        setEditingId(id);
        setShowForm(true);
      } else {
        alert('Espécie não encontrada. Pode ter sido removida.');
        await loadEspecies(); // Recarregar lista
      }
    } catch (err) {
      console.error('Erro ao carregar dados da espécie:', err);
      alert('Erro ao carregar dados da espécie para edição.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta espécie?')) {
      try {
        setLoading(true);
        await especiesService.delete(id);
        console.log('Espécie excluída com sucesso!');
        
        // Atualizar a lista em memória
        setEspecies(prev => prev.filter(especie => especie.id !== id));
        
        // Recarregar a lista completa para garantir sincronização
        await loadEspecies();
      } catch (err) {
        console.error('Erro ao excluir espécie:', err);
        alert('Ocorreu um erro ao excluir a espécie. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      setLoading(true);
      
      // Encontrar a espécie na lista atual
      const especie = especies.find(esp => esp.id === id);
      if (!especie) {
        throw new Error('Espécie não encontrada');
      }
      
      // Inverter o status
      const novoStatus = !especie.ativo;
      
      // Atualizar no Firebase
      await especiesService.update(id, { ativo: novoStatus });
      console.log(`Status da espécie alterado para: ${novoStatus ? 'Ativo' : 'Inativo'}`);
      
      // Atualizar a lista em memória
      setEspecies(prev => 
        prev.map(especie => 
          especie.id === id ? { ...especie, ativo: novoStatus } : especie
        )
      );
      
      // Recarregar a lista completa para garantir sincronização
      await loadEspecies();
    } catch (err) {
      console.error('Erro ao alterar status da espécie:', err);
      alert('Ocorreu um erro ao alterar o status da espécie. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEspecies = especies.filter(especie => 
    especie.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    especie.nomeCientifico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    especie.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <PageHeader 
        title="Cadastro de Espécies"
        description="Gerencie as espécies de madeira utilizadas nos romaneios e orçamentos."
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
            placeholder="Buscar espécies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <AddButton onClick={() => {
          setIsEditing(false);
          setFormData({
            nome: '',
            nomeCientifico: '',
            densidade: '',
            categoria: '',
            descricao: '',
            ativo: true
          });
          setShowForm(true);
        }} disabled={loading}>
          <i className="fas fa-plus"></i> Nova Espécie
        </AddButton>
      </ActionsBar>

      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Carregando...</LoadingText>
        </LoadingContainer>
      )}

      {!loading && filteredEspecies.length === 0 && (
        <EmptyState>
          <i className="fas fa-tree"></i>
          <h3>Nenhuma espécie encontrada</h3>
          <p>Adicione sua primeira espécie ou ajuste sua busca.</p>
        </EmptyState>
      )}

      {!loading && filteredEspecies.length > 0 && (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Nome Científico</th>
                <th>Densidade</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEspecies.map(especie => (
                <tr key={especie.id}>
                  <td>{especie.nome}</td>
                  <td>{especie.nomeCientifico}</td>
                  <td>{especie.densidade} g/cm³</td>
                  <td>{especie.categoria}</td>
                  <td>
                    <StatusBadge active={especie.ativo}>
                      {especie.ativo ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButtons>
                      <ActionButton 
                        onClick={() => handleEdit(especie.id)}
                        disabled={loading}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </ActionButton>
                      <ActionButton 
                        onClick={() => toggleStatus(especie.id)}
                        disabled={loading}
                        title={especie.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <i className={`fas fa-${especie.ativo ? 'toggle-on' : 'toggle-off'}`}></i>
                      </ActionButton>
                      <DeleteButton 
                        onClick={() => handleDelete(especie.id)}
                        disabled={loading}
                        title="Excluir"
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
            <h2>{isEditing ? 'Editar Espécie' : 'Nova Espécie'}</h2>
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
                  placeholder="Nome da espécie"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="nomeCientifico">Nome Científico</Label>
                <Input
                  type="text"
                  id="nomeCientifico"
                  name="nomeCientifico"
                  value={formData.nomeCientifico}
                  onChange={handleInputChange}
                  placeholder="Nome científico"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="densidade">Densidade (g/cm³)</Label>
                <Input
                  type="number"
                  id="densidade"
                  name="densidade"
                  value={formData.densidade}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Ex: 0.55"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="descricao">Descrição</Label>
              <TextArea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={3}
                placeholder="Descrição e características da espécie"
              />
            </FormGroup>

            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="ativo">Espécie Ativa</CheckboxLabel>
            </CheckboxContainer>

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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.medium};
`;

const Checkbox = styled.input`
  margin-right: ${props => props.theme.spacing.small};
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme.colors.dark};
  cursor: pointer;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.active ? '#e3fcef' : '#ffe9e9'};
  color: ${props => props.active ? '#0d9f6e' : '#e53e3e'};
  border: 1px solid ${props => props.active ? '#abebd2' : '#fab6b6'};
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Especies; 