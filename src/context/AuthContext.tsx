import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { Usuario, Empresa, usuariosService, empresasService } from '../services/firebaseService';

// Interface simplificada para representar o usuário do Firebase
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Definir os tipos para o contexto
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userInfo: Usuario | null;
  currentEmpresa: Empresa | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentEmpresa: (empresa: Empresa) => void;
}

// Criar o contexto com valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Props para o provider
interface AuthProviderProps {
  children: ReactNode;
}

// Componente Provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<Usuario | null>(null);
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Efeito para observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      // Simplificar o objeto do usuário para evitar problemas de tipagem
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        
        try {
          // Verificar se o serviço está disponível
          if (!usuariosService.getByEmail) {
            throw new Error('Serviço de usuários não está disponível');
          }
          
          // Carregar informações do usuário do Firestore
          const dbUser = await usuariosService.getByEmail(user.email || '');
          
          if (dbUser) {
            setUserInfo(dbUser);
            
            // Verificar se o serviço está disponível
            if (!empresasService.getById) {
              throw new Error('Serviço de empresas não está disponível');
            }
            
            // Carregar empresa do usuário
            const empresa = await empresasService.getById(dbUser.empresaId);
            if (empresa) {
              console.log('AuthContext: Empresa carregada do Firestore:', empresa);
              
              // Atualizar o estado
              setCurrentEmpresa(empresa);
              
              // Persistir no localStorage para acesso por outras partes da aplicação
              try {
                localStorage.setItem('currentEmpresa', JSON.stringify(empresa));
                console.log('AuthContext: Empresa salva no localStorage após login');
                
                // Backup na sessionStorage
                sessionStorage.setItem('currentEmpresa', JSON.stringify(empresa));
                console.log('AuthContext: Backup da empresa salvo na sessionStorage');
              } catch (error) {
                console.error('AuthContext: Erro ao salvar empresa no localStorage:', error);
              }
            } else {
              console.error(`Empresa não encontrada para o ID: ${dbUser.empresaId}`);
              setError('Empresa não encontrada. Entre em contato com o administrador.');
            }
          } else {
            console.error('Usuário autenticado, mas não encontrado no Firestore:', user.email);
            setError('Usuário não configurado no sistema. Entre em contato com o administrador.');
          }
        } catch (err) {
          console.error('Erro ao carregar dados do usuário:', err);
          setError('Erro ao carregar dados do usuário.');
        }
      } else {
        // Limpar dados do usuário ao fazer logout
        setCurrentUser(null);
        setUserInfo(null);
        setCurrentEmpresa(null);
      }
      
      setLoading(false);
    });
    
    // Limpar o observer quando o componente for desmontado
    return () => unsubscribe();
  }, []);
  
  // Função para login
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // O useEffect acima irá lidar com a atualização do estado
      console.log('Login bem-sucedido:', userCredential.user.email);
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      // Se for um erro de credencial inválida ou usuário não encontrado
      // E se for o usuário admin@sismad.com, tenta criar 
      if ((err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') 
          && email === 'admin@sismad.com') {
        try {
          console.log('Tentando criar usuário de teste admin@sismad.com');
          await createUserWithEmailAndPassword(auth, 'admin@sismad.com', 'admin123');
          console.log('Usuário admin@sismad.com criado com sucesso');
          
          // Tentar fazer login novamente
          const userCredential = await signInWithEmailAndPassword(auth, 'admin@sismad.com', 'admin123');
          console.log('Login bem-sucedido após criar usuário:', userCredential.user.email);
          return;
        } catch (createError: any) {
          console.error('Erro ao criar usuário admin@sismad.com:', createError);
          if (createError.code === 'auth/email-already-in-use') {
            // Se o usuário já existe, o problema é a senha. Informe ao usuário.
            setError('Credenciais inválidas. Verifique se a senha está correta.');
          } else {
            setError(`Erro ao criar usuário: ${createError.message}`);
          }
        }
      } else {
        // Traduzir mensagens de erro do Firebase
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Email ou senha inválidos.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('Muitas tentativas de login. Tente novamente mais tarde.');
        } else {
          setError(`Erro no login: ${err.message}`);
        }
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Função para logout
  const logout = async () => {
    setError(null);
    
    try {
      await firebaseSignOut(auth);
      // O useEffect acima irá lidar com a atualização do estado
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError(`Erro ao fazer logout: ${err.message}`);
      throw err;
    }
  };
  
  // Função para definir a empresa atual (para casos onde o usuário tem acesso a mais de uma)
  const changeEmpresa = (empresa: Empresa) => {
    console.log('AuthContext: Atualizando empresa atual:', empresa);
    
    // Atualizar o estado
    setCurrentEmpresa(empresa);
    
    // Persistir no localStorage para acesso por outras partes da aplicação
    try {
      localStorage.setItem('currentEmpresa', JSON.stringify(empresa));
      console.log('AuthContext: Empresa salva no localStorage');
    } catch (error) {
      console.error('AuthContext: Erro ao salvar empresa no localStorage:', error);
    }
  };
  
  // Valor a ser fornecido pelo contexto
  const value: AuthContextType = {
    currentUser,
    userInfo,
    currentEmpresa,
    loading,
    error,
    login,
    logout,
    setCurrentEmpresa: changeEmpresa
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 