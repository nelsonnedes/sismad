import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, loading: authLoading, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // O redirecionamento será feito pelo useEffect quando currentUser for atualizado
    } catch (err: any) {
      // O erro já é tratado no contexto de autenticação
      setError(authError || 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginFormContainer>
        <LogoContainer>
          <Logo>
            <i className="fas fa-tree"></i> SISMAD
          </Logo>
          <LogoSubtitle>Sistema para Madeireiras</LogoSubtitle>
        </LogoContainer>

        <Form onSubmit={handleSubmit}>
          <Title>Login</Title>
          <Subtitle>Entre com suas credenciais para acessar o sistema</Subtitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Seu email"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <PasswordContainer>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
              />
            </PasswordContainer>
            <ForgotPassword>Esqueceu a senha?</ForgotPassword>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <span>Entrando... <i className="fas fa-circle-notch fa-spin"></i></span>
            ) : (
              "Entrar"
            )}
          </SubmitButton>
        </Form>

        <Footer>
          <p>Para fins de teste, use:</p>
          <p><strong>Email:</strong> admin@sismad.com</p>
          <p><strong>Senha:</strong> admin123</p>
          <p><small>(O sistema criará este usuário automaticamente no primeiro acesso)</small></p>
        </Footer>

        <RegisterLink>
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </RegisterLink>
      </LoginFormContainer>

      <ImageContainer>
        <Overlay />
        <LoginImage />
        <WelcomeText>
          <h1>Bem-vindo ao SISMAD</h1>
          <p>Sistema de Gerenciamento para Madeireiras</p>
        </WelcomeText>
      </ImageContainer>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};

  @media (max-width: 992px) {
    flex-direction: column-reverse;
  }
`;

const LoginFormContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.large};
  background-color: ${props => props.theme.colors.cardBackground};
  position: relative;
  overflow: auto;

  @media (max-width: 992px) {
    padding: ${props => props.theme.spacing.medium};
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.medium};
  left: ${props => props.theme.spacing.medium};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  
  i {
    margin-right: ${props => props.theme.spacing.small};
  }
`;

const LogoSubtitle = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.secondary};
  margin-left: 27px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.dark};
  margin-bottom: ${props => props.theme.spacing.small};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.secondary};
  margin-bottom: ${props => props.theme.spacing.large};
`;

const FormGroup = styled.div`
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
  font-size: ${props => props.theme.fontSizes.small};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const ForgotPassword = styled.a`
  display: block;
  text-align: right;
  margin-top: ${props => props.theme.spacing.small};
  color: ${props => props.theme.colors.primary};
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.medium};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.small};
  font-weight: 600;
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.default};
  margin-top: ${props => props.theme.spacing.medium};
  
  &:hover:not(:disabled) {
    background-color: #0b5ed7; // Slightly darker
  }
  
  &:disabled {
    background-color: #84b0e9; // Lighter version
    cursor: not-allowed;
  }
  
  i {
    margin-left: ${props => props.theme.spacing.small};
  }
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.small};
  margin-bottom: ${props => props.theme.spacing.medium};
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.875rem;
`;

const Footer = styled.div`
  position: absolute;
  bottom: ${props => props.theme.spacing.medium};
  text-align: center;
  padding: ${props => props.theme.spacing.medium};
  color: ${props => props.theme.colors.secondary};
  font-size: 0.875rem;
  background-color: ${props => props.theme.colors.lightBackground};
  border-radius: ${props => props.theme.borderRadius.small};
  margin-top: ${props => props.theme.spacing.large};
  width: 90%;
  max-width: 400px;

  p {
    margin: 2px 0;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  position: relative;
  
  @media (max-width: 992px) {
    height: 200px;
  }
`;

const LoginImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1473448912268-2022ce9509d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80');
  background-size: cover;
  background-position: center;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const WelcomeText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 2;
  width: 80%;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: ${props => props.theme.spacing.medium};
    
    @media (max-width: 1200px) {
      font-size: 2rem;
    }
  }
  
  p {
    font-size: 1.25rem;
    opacity: 0.9;
    
    @media (max-width: 1200px) {
      font-size: 1rem;
    }
  }
`;

const RegisterLink = styled.div`
  margin-top: ${props => props.theme.spacing.medium};
  text-align: center;
  color: ${props => props.theme.colors.primary};
  font-size: 0.875rem;

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Login; 