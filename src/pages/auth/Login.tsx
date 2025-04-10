import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import LogoSVG from '../../assets/logo.svg';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.large};
`;

const LoginCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: ${({ theme }) => theme.spacing.large};
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.large};
  
  img {
    width: 100px;
    height: 100px;
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }
  
  h1 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.xlarge};
    margin: 0;
    text-align: center;
  }
  
  p {
    color: ${({ theme }) => theme.colors.secondary};
    margin-top: ${({ theme }) => theme.spacing.small};
    text-align: center;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.colors.dark};
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.default};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const InfoText = styled.p`
  margin-top: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.small};
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirecionar para o dashboard em caso de sucesso
      navigate('/');
    } catch (err: any) {
      // Tratar erros comuns do Firebase
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou senha inválidos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else {
        setError(`Erro no login: ${err.message}`);
      }
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Para fins de desenvolvimento, login sem autenticação
  const handleDevLogin = () => {
    navigate('/');
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <img src={LogoSVG} alt="SISMAD Logo" />
          <h1>SISMAD</h1>
          <p>Sistema de Gestão para Madeireiras</p>
        </Logo>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleLogin}>
          <FormGroup>
            <Label htmlFor="email">E-mail:</Label>
            <Input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={loading}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Senha:</Label>
            <Input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              disabled={loading}
              required
            />
          </FormGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
        
        <InfoText>
          Esqueceu sua senha? Entre em contato com o administrador.
        </InfoText>
        
        {/* Botão para desenvolvimento - remover em produção */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={handleDevLogin} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Modo Desenvolvimento: Entrar sem autenticação
          </button>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 