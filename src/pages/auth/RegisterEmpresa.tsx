import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { empresasService, usuariosService, Empresa, Usuario } from '../../services/firebaseService';
import LogoSVG from '../../assets/logo.svg';

// Componentes estilizados
const RegisterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const FormSection = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.cardBackground};
  
  @media (max-width: 992px) {
    width: 100%;
  }
`;

const ImgSection = styled.div`
  flex: 1;
  background-image: url('/images/wood-bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  
  @media (max-width: 992px) {
    display: none;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
  text-align: center;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: ${props => props.theme.shadows.medium};
  background-color: white;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  
  img {
    height: 60px;
  }
  
  h1 {
    margin-left: 1rem;
    font-size: 1.8rem;
    color: ${props => props.theme.colors.primary};
  }
`;

const StepIndicator = styled.div`
  display: flex;
  margin-bottom: 2rem;
  justify-content: center;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => 
    props.completed 
      ? props.theme.colors.success 
      : props.active 
        ? props.theme.colors.primary 
        : '#e9ecef'};
  color: ${props => (props.completed || props.active) ? 'white' : '#495057'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1rem;
  position: relative;
  font-weight: bold;
  
  &::before {
    content: '';
    position: absolute;
    left: -100%;
    top: 50%;
    height: 2px;
    width: 100%;
    background-color: ${props => 
      props.completed 
        ? props.theme.colors.success 
        : '#e9ecef'};
  }
  
  &:first-child::before {
    display: none;
  }
`;

const StepLabel = styled.div`
  position: absolute;
  bottom: -25px;
  white-space: nowrap;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.text};
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.dark};
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #0b5ed7; // Slightly darker
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const BackButton = styled(Button)`
  background-color: ${props => props.theme.colors.light};
  color: ${props => props.theme.colors.dark};
  
  &:hover:not(:disabled) {
    background-color: #e2e6ea; // Slightly darker
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #d4edda;
  color: #155724;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.875rem;
`;

const LogoPreviewContainer = styled.div`
  margin-top: 0.5rem;
  text-align: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${props => props.theme.borderRadius.small};
  }
`;

interface EmpresaFormData {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  logo?: File | null;
}

interface UsuarioFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const RegisterEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Dados do formulário
  const [empresaData, setEmpresaData] = useState<EmpresaFormData>({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    logo: null
  });
  
  const [usuarioData, setUsuarioData] = useState<UsuarioFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  
  // Funções para lidar com mudanças nos formulários
  const handleEmpresaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmpresaData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEmpresaData(prev => ({ ...prev, logo: file }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsuarioData(prev => ({ ...prev, [name]: value }));
  };
  
  // Função para avançar para o próximo passo
  const handleNext = () => {
    // Validar dados da empresa
    if (
      !empresaData.nome || 
      !empresaData.cnpj || 
      !empresaData.endereco || 
      !empresaData.cidade || 
      !empresaData.estado
    ) {
      setError('Preencha todos os campos obrigatórios da empresa.');
      return;
    }
    
    setError(null);
    setStep(2);
  };
  
  // Função para voltar para o passo anterior
  const handleBack = () => {
    setError(null);
    setStep(1);
  };
  
  // Função para finalizar o cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados do usuário
    if (!usuarioData.nome || !usuarioData.email || !usuarioData.senha) {
      setError('Preencha todos os campos obrigatórios do usuário.');
      return;
    }
    
    if (usuarioData.senha !== usuarioData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (usuarioData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Upload da logo se existir
      let logoUrl = '';
      if (empresaData.logo) {
        const storage = getStorage();
        const storageRef = ref(storage, `logos/${Date.now()}_${empresaData.logo.name}`);
        await uploadBytes(storageRef, empresaData.logo);
        logoUrl = await getDownloadURL(storageRef);
      }
      
      // 1. Criar empresa no Firestore
      const empresaId = await empresasService.create({
        ...empresaData,
        logo: logoUrl,
        dataCadastro: new Date(),
        ativa: true,
        configuracoes: {
          corPrimaria: '#0d6efd',
          corSecundaria: '#6c757d',
          tema: 'light'
        }
      });
      
      // 2. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        usuarioData.email, 
        usuarioData.senha
      );
      
      // 3. Criar registro do usuário no Firestore
      await usuariosService.create({
        nome: usuarioData.nome,
        email: usuarioData.email,
        empresaId,
        tipo: 'admin', // O primeiro usuário é sempre admin
        ativo: true,
        dataCadastro: new Date()
      });
      
      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
      
      // Aguardar alguns segundos antes de redirecionar
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      
      // Tratar erros específicos do Firebase
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está sendo utilizado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(`Erro ao fazer cadastro: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <FormSection>
        <Logo>
          <img src={LogoSVG} alt="SISMAD Logo" />
          <h1>SISMAD</h1>
        </Logo>
        
        <FormCard>
          <StepIndicator>
            <Step active={step === 1} completed={step > 1}>
              1
              <StepLabel>Empresa</StepLabel>
            </Step>
            <Step active={step === 2} completed={step > 2}>
              2
              <StepLabel>Usuário</StepLabel>
            </Step>
          </StepIndicator>
          
          <Title>
            {step === 1 ? 'Cadastro de Empresa' : 'Cadastro de Usuário Administrador'}
          </Title>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          {step === 1 ? (
            <>
              <FormGroup>
                <Label htmlFor="nome">Nome da Empresa*</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={empresaData.nome}
                  onChange={handleEmpresaChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="cnpj">CNPJ*</Label>
                <Input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={empresaData.cnpj}
                  onChange={handleEmpresaChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="logo">Logo da Empresa</Label>
                <Input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <LogoPreviewContainer>
                    <img src={logoPreview} alt="Preview da logo" />
                  </LogoPreviewContainer>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="endereco">Endereço*</Label>
                <Input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={empresaData.endereco}
                  onChange={handleEmpresaChange}
                  required
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="cidade">Cidade*</Label>
                  <Input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={empresaData.cidade}
                    onChange={handleEmpresaChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="estado">Estado*</Label>
                  <Select
                    id="estado"
                    name="estado"
                    value={empresaData.estado}
                    onChange={handleEmpresaChange}
                    required
                  >
                    <option value="">Selecione</option>
                    {estados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </Select>
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    type="text"
                    id="cep"
                    name="cep"
                    value={empresaData.cep}
                    onChange={handleEmpresaChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={empresaData.telefone}
                    onChange={handleEmpresaChange}
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={empresaData.email}
                  onChange={handleEmpresaChange}
                />
              </FormGroup>
              
              <ButtonsContainer>
                <BackButton type="button" onClick={() => navigate('/login')}>
                  Voltar para Login
                </BackButton>
                <Button type="button" onClick={handleNext}>
                  Próximo
                </Button>
              </ButtonsContainer>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="nome">Nome Completo*</Label>
                <Input
                  type="text"
                  id="nome"
                  name="nome"
                  value={usuarioData.nome}
                  onChange={handleUsuarioChange}
                  required
                  disabled={loading}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email*</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={usuarioData.email}
                  onChange={handleUsuarioChange}
                  required
                  disabled={loading}
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="senha">Senha*</Label>
                  <Input
                    type="password"
                    id="senha"
                    name="senha"
                    value={usuarioData.senha}
                    onChange={handleUsuarioChange}
                    required
                    disabled={loading}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="confirmarSenha">Confirmar Senha*</Label>
                  <Input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={usuarioData.confirmarSenha}
                    onChange={handleUsuarioChange}
                    required
                    disabled={loading}
                  />
                </FormGroup>
              </FormRow>
              
              <p>
                Como administrador, você terá acesso a todas as funcionalidades do sistema, 
                incluindo gerenciar usuários e configurações da empresa.
              </p>
              
              <ButtonsContainer>
                <BackButton type="button" onClick={handleBack} disabled={loading}>
                  Voltar
                </BackButton>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                </Button>
              </ButtonsContainer>
            </form>
          )}
        </FormCard>
      </FormSection>
      
      <ImgSection>
        <Overlay>
          <h1>Bem-vindo ao SISMAD</h1>
          <h2>Sistema de Gestão para Madeireiras</h2>
          <p>
            Cadastre sua empresa e comece a utilizar nosso sistema 
            completo para gerenciamento de madeireiras.
          </p>
        </Overlay>
      </ImgSection>
    </RegisterContainer>
  );
};

export default RegisterEmpresa; 