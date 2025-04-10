import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Usuario, usuariosService } from '../../services/firebaseService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import PageHeader from '../../components/PageHeader';

// Componentes estilizados
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

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.medium};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    background-color: ${({ theme }) => theme.colors.light};
    font-weight: 600;
  }
  
  tr:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const AddButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.successDark};
  }
`;

const EditButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.warning};
  margin-right: ${({ theme }) => theme.spacing.small};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.warningDark};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.danger};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerDark};
  }
`;

const StatusBadge = styled.span<{ active?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.small};
  background-color: ${({ active, theme }) => 
    active ? `${theme.colors.success}22` : `${theme.colors.danger}22`};
  color: ${({ active, theme }) => 
    active ? theme.colors.success : theme.colors.danger};
  border: 1px solid ${({ active, theme }) => 
    active ? theme.colors.success : theme.colors.danger};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 500px;
`;

const ModalTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.primary};
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.normal};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.normal};
  background-color: white;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => `${theme.colors.danger}11`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.danger};
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => `${theme.colors.success}11`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.success};
`;

// Interface para o usuário no formulário
interface UserFormData {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
  tipo: 'admin' | 'usuario';
  ativo: boolean;
}

const Usuarios: React.FC = () => {
  const { currentEmpresa, userInfo } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estado para o modal de usuário
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
    ativo: true
  });
  
  // Verifica se o usuário atual é administrador
  const isAdmin = userInfo?.tipo === 'admin';
  
  // Carregar usuários da empresa
  useEffect(() => {
    if (currentEmpresa) {
      loadUsuarios();
    }
  }, [currentEmpresa]);
  
  // Função para carregar usuários
  const loadUsuarios = async () => {
    if (!currentEmpresa) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await usuariosService.getByEmpresaId(currentEmpresa.id);
      setUsuarios(data);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError(`Erro ao carregar usuários: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para abrir o modal de adicionar usuário
  const handleAddUser = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo: 'usuario',
      ativo: true
    });
    setIsEditing(false);
    setModalError(null);
    setShowModal(true);
  };
  
  // Função para abrir o modal de editar usuário
  const handleEditUser = (usuario: Usuario) => {
    setFormData({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      ativo: usuario.ativo
    });
    setIsEditing(true);
    setModalError(null);
    setShowModal(true);
  };
  
  // Função para lidar com alterações no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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
  
  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Função para salvar usuário
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setModalError('Você não tem permissão para realizar esta ação.');
      return;
    }
    
    if (!currentEmpresa) {
      setModalError('Empresa não encontrada.');
      return;
    }
    
    // Validações básicas
    if (!formData.nome || !formData.email || (!isEditing && !formData.senha)) {
      setModalError('Preencha todos os campos obrigatórios.');
      return;
    }
    
    setModalLoading(true);
    setModalError(null);
    
    try {
      if (isEditing) {
        // Atualizar usuário existente
        if (!formData.id) throw new Error('ID do usuário não encontrado.');
        
        await usuariosService.update(formData.id, {
          nome: formData.nome,
          email: formData.email,
          tipo: formData.tipo,
          ativo: formData.ativo
        });
        
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        // 1. Criar conta no Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha || '');
        
        // 2. Salvar dados do usuário no Firestore
        await usuariosService.create({
          nome: formData.nome,
          email: formData.email,
          empresaId: currentEmpresa.id,
          tipo: formData.tipo,
          ativo: formData.ativo,
          dataCadastro: new Date()
        });
        
        setSuccess('Usuário criado com sucesso!');
      }
      
      // Atualizar a lista de usuários
      await loadUsuarios();
      
      // Fechar o modal
      setShowModal(false);
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      
      // Tratar erros específicos do Firebase
      if (err.code === 'auth/email-already-in-use') {
        setModalError('Este email já está sendo utilizado.');
      } else if (err.code === 'auth/invalid-email') {
        setModalError('Email inválido.');
      } else if (err.code === 'auth/weak-password') {
        setModalError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setModalError(`Erro ao salvar usuário: ${err.message}`);
      }
    } finally {
      setModalLoading(false);
    }
  };
  
  // Função para excluir/desativar usuário
  const handleDeleteUser = async (usuario: Usuario) => {
    if (!isAdmin) {
      setError('Você não tem permissão para realizar esta ação.');
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja ${usuario.ativo ? 'desativar' : 'ativar'} o usuário ${usuario.nome}?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Não excluir realmente, apenas desativar
      await usuariosService.update(usuario.id, {
        ativo: !usuario.ativo
      });
      
      setSuccess(`Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      
      // Atualizar a lista de usuários
      await loadUsuarios();
    } catch (err: any) {
      console.error('Erro ao atualizar status do usuário:', err);
      setError(`Erro ao atualizar status do usuário: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar se o usuário tem permissão para acessar a página
  if (!currentEmpresa) {
    return (
      <Container>
        <PageHeader 
          title="Gerenciamento de Usuários" 
          description="Adicione e gerencie usuários do sistema"
        />
        <ErrorMessage>
          Nenhuma empresa encontrada. Entre em contato com o administrador do sistema.
        </ErrorMessage>
      </Container>
    );
  }
  
  if (!isAdmin) {
    return (
      <Container>
        <PageHeader 
          title="Gerenciamento de Usuários" 
          description="Adicione e gerencie usuários do sistema"
        />
        <ErrorMessage>
          Você não tem permissão para acessar esta página.
        </ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title="Gerenciamento de Usuários" 
        description="Adicione e gerencie usuários do sistema"
      />
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <FormCard>
        <SectionTitle>Usuários Cadastrados</SectionTitle>
        
        <AddButton onClick={handleAddUser} disabled={loading || !isAdmin}>
          <i className="fas fa-plus"></i> Adicionar Usuário
        </AddButton>
        
        {loading ? (
          <p>Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p>Nenhum usuário cadastrado ainda.</p>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'}</td>
                    <td>
                      <StatusBadge active={usuario.ativo}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </td>
                    <td>
                      <EditButton 
                        onClick={() => handleEditUser(usuario)}
                        disabled={loading || !isAdmin}
                      >
                        Editar
                      </EditButton>
                      <DeleteButton 
                        onClick={() => handleDeleteUser(usuario)}
                        disabled={loading || !isAdmin}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </DeleteButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </FormCard>
      
      {/* Modal para adicionar/editar usuário */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
            </ModalTitle>
            
            {modalError && <ErrorMessage>{modalError}</ErrorMessage>}
            
            <form onSubmit={handleSaveUser}>
              <FormGroup>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  disabled={modalLoading}
                  required
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
                  disabled={modalLoading || isEditing}
                  required
                />
              </FormGroup>
              
              {!isEditing && (
                <FormGroup>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    disabled={modalLoading}
                    required
                    minLength={6}
                  />
                  <small>A senha deve ter pelo menos 6 caracteres.</small>
                </FormGroup>
              )}
              
              <FormGroup>
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  disabled={modalLoading}
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>
                  <Input
                    type="checkbox"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, ativo: e.target.checked }))
                    }
                    disabled={modalLoading}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  Usuário Ativo
                </Label>
              </FormGroup>
              
              <ModalButtons>
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Usuarios; 