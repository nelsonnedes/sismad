import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Empresa, empresasService } from '../../services/firebaseService';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import PageHeader from '../../components/PageHeader';
import LogoDisplay from '../../components/LogoDisplay';

// Interface para os props de tema
interface ThemedProps {
  theme: any;
}

// Componentes estilizados
const Container = styled.div`
  padding: 20px;
`;

const FormCard = styled.div`
  background: ${({ theme }: ThemedProps) => theme.colors.cardBackground};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.medium};
  box-shadow: ${({ theme }: ThemedProps) => theme.shadows.small};
  padding: ${({ theme }: ThemedProps) => theme.spacing.large};
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.large};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
  color: ${({ theme }: ThemedProps) => theme.colors.primary};
`;

const FormContainer = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: ThemedProps) => theme.spacing.large};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.small};
  font-weight: 500;
  color: ${({ theme }: ThemedProps) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }: ThemedProps) => theme.spacing.medium};
  border: 1px solid ${({ theme }: ThemedProps) => theme.colors.border};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  font-size: ${({ theme }: ThemedProps) => theme.fontSizes.normal};
  
  &:focus {
    border-color: ${({ theme }: ThemedProps) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }: ThemedProps) => `${theme.colors.primary}33`};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }: ThemedProps) => theme.spacing.medium};
  border: 1px solid ${({ theme }: ThemedProps) => theme.colors.border};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  font-size: ${({ theme }: ThemedProps) => theme.fontSizes.normal};
  background-color: white;
  
  &:focus {
    border-color: ${({ theme }: ThemedProps) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }: ThemedProps) => `${theme.colors.primary}33`};
  }
`;

const Button = styled.button`
  padding: ${({ theme }: ThemedProps) => theme.spacing.medium} ${({ theme }: ThemedProps) => theme.spacing.large};
  background-color: ${({ theme }: ThemedProps) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  font-size: ${({ theme }: ThemedProps) => theme.fontSizes.normal};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }: ThemedProps) => theme.colors.secondary};
  }
  
  &:disabled {
    background-color: ${({ theme }: ThemedProps) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }: ThemedProps) => theme.spacing.large};
  grid-column: 1 / -1;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }: ThemedProps) => theme.colors.danger};
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
  padding: ${({ theme }: ThemedProps) => theme.spacing.medium};
  background-color: ${({ theme }: ThemedProps) => `${theme.colors.danger}11`};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }: ThemedProps) => theme.colors.danger};
`;

const SuccessMessage = styled.div`
  color: ${({ theme }: ThemedProps) => theme.colors.success};
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
  padding: ${({ theme }: ThemedProps) => theme.spacing.medium};
  background-color: ${({ theme }: ThemedProps) => `${theme.colors.success}11`};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }: ThemedProps) => theme.colors.success};
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
  grid-column: 1 / -1;
`;

const LogoPreview = styled.div`
  width: 150px;
  height: 150px;
  border: 1px solid ${({ theme }: ThemedProps) => theme.colors.border};
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.medium};
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const LogoUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const FileInput = styled.input`
  width: 100%;
  max-width: 300px;
  margin-bottom: ${({ theme }: ThemedProps) => theme.spacing.small};
`;

const RemoveLogoButton = styled.button`
  margin-top: ${({ theme }: ThemedProps) => theme.spacing.small};
  padding: ${({ theme }: ThemedProps) => theme.spacing.small} ${({ theme }: ThemedProps) => theme.spacing.medium};
  background-color: ${({ theme }: ThemedProps) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: ${({ theme }: ThemedProps) => theme.borderRadius.small};
  cursor: pointer;
  
  &:hover {
    background-color: #dc3545;
  }
  
  &:disabled {
    background-color: ${({ theme }: ThemedProps) => theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const UploadProgress = styled.div`
  width: 100%;
  max-width: 300px;
  margin: ${({ theme }: ThemedProps) => theme.spacing.small} 0;
  text-align: center;
`;

const ProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${(props: { percentage: number }) => `${props.percentage}%`};
  background-color: ${({ theme }: ThemedProps) => theme.colors.primary};
  transition: width 0.3s ease;
`;

const DadosEmpresa: React.FC = () => {
  const { currentEmpresa, userInfo, setCurrentEmpresa } = useAuth();
  const [formData, setFormData] = useState<Omit<Empresa, 'id'>>({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    dataCadastro: new Date(),
    ativa: true,
    logo: '',
    configuracoes: {
      corPrimaria: '#0d6efd',
      corSecundaria: '#6c757d',
      tema: 'light'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [uploadState, setUploadState] = useState<{
    uploading: boolean;
    progress: number;
    message: string;
  }>({
    uploading: false,
    progress: 0,
    message: ''
  });
  
  // Verifica se o usuário tem permissão para editar (apenas admin)
  const canEdit = userInfo?.tipo === 'admin';
  
  // Estados brasileiros para o select
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  // Carrega os dados da empresa atual
  useEffect(() => {
    if (currentEmpresa) {
      setFormData({
        nome: currentEmpresa.nome,
        cnpj: currentEmpresa.cnpj,
        endereco: currentEmpresa.endereco,
        cidade: currentEmpresa.cidade,
        estado: currentEmpresa.estado,
        cep: currentEmpresa.cep,
        telefone: currentEmpresa.telefone,
        email: currentEmpresa.email,
        dataCadastro: currentEmpresa.dataCadastro,
        ativa: currentEmpresa.ativa,
        logo: currentEmpresa.logo,
        configuracoes: currentEmpresa.configuracoes || {
          corPrimaria: '#0d6efd',
          corSecundaria: '#6c757d',
          tema: 'light'
        }
      });
      
      // Define a URL da logo para preview
      if (currentEmpresa.logo) {
        setLogoPreview(currentEmpresa.logo);
      }
    }
  }, [currentEmpresa]);
  
  // Função para lidar com alterações nos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Verificar se é um campo de configuração
    if (name.startsWith('config_')) {
      const configName = name.replace('config_', '') as keyof Empresa['configuracoes'];
      setFormData(prev => ({
        ...prev,
        configuracoes: {
          ...prev.configuracoes,
          [configName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Função para lidar com o upload da logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setRemoveLogo(false);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para remover a logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };
  
  // Função para salvar os dados da empresa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      setError('Você não tem permissão para editar os dados da empresa.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadState({
      uploading: false,
      progress: 0,
      message: ''
    });
    
    try {
      if (!currentEmpresa?.id) {
        throw new Error('ID da empresa não encontrado.');
      }
      
      // Verificar se há uma alteração na logo
      const isLogoChanged = logoFile || removeLogo;
      
      // Se a logo não mudou, podemos atualizar apenas os dados de texto
      if (!isLogoChanged) {
        // Verificar se o serviço de empresa está disponível
        if (!empresasService.update) {
          throw new Error('Serviço de empresas não disponível');
        }
        
        await empresasService.update(currentEmpresa.id, formData);
        
        // Atualizar o objeto da empresa no contexto
        const updatedEmpresa = {
          ...currentEmpresa,
          ...formData
        };
        setCurrentEmpresa(updatedEmpresa);
        
        setSuccess('Dados da empresa atualizados com sucesso!');
        setIsEditing(false);
        return;
      }
      
      // A partir daqui, sabemos que a logo foi alterada
      let logoUrl = formData.logo;
      
      // Se há uma logo para remover
      if (removeLogo && formData.logo) {
        try {
          setUploadState({
            uploading: true,
            progress: 10,
            message: 'Removendo logo antiga...'
          });
          
          // Aqui evitamos o problema de CORS optando por não remover a imagem antiga
          // apenas marcar como não usada
          logoUrl = '';
          
          setUploadState(prev => ({
            ...prev,
            progress: 30,
            message: 'Logo removida com sucesso'
          }));
        } catch (err) {
          console.error('Erro ao remover logo antiga:', err);
          // Continuar mesmo se falhar ao remover a imagem antiga
        }
      }
      
      // Se há um novo arquivo para fazer upload
      if (logoFile) {
        try {
          setUploadState({
            uploading: true,
            progress: 20,
            message: 'Redimensionando imagem...'
          });
          
          // Reduzir a qualidade da imagem antes do upload
          const resizedImage = await resizeImage(logoFile, 400, 400);
          
          setUploadState(prev => ({
            ...prev,
            progress: 40,
            message: 'Tentando alternativa para upload...'
          }));
          
          // Solução alternativa: usar Base64 em vez de upload direto
          // Convertemos a imagem para Base64 e armazenamos esse valor
          const reader = new FileReader();
          
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64data = reader.result as string;
              resolve(base64data);
            };
            reader.onerror = () => {
              reject(new Error('Erro ao converter imagem para Base64'));
            };
          });
          
          reader.readAsDataURL(resizedImage);
          
          setUploadState(prev => ({
            ...prev,
            progress: 70,
            message: 'Processando imagem...'
          }));
          
          // Esperar que a conversão para Base64 seja concluída
          logoUrl = await base64Promise;
          
          setUploadState(prev => ({
            ...prev,
            progress: 80,
            message: 'Imagem processada com sucesso'
          }));
        } catch (err) {
          console.error('Erro ao fazer upload da logo:', err);
          setError(`Erro ao fazer upload da logo: ${err}`);
          setLoading(false);
          return;
        }
      }
      
      // Atualizar o objeto com a nova URL da logo
      const updatedData = {
        ...formData,
        logo: logoUrl
      };
      
      setUploadState(prev => ({
        ...prev,
        progress: 90,
        message: 'Salvando dados da empresa...'
      }));
      
      // Verificar se o serviço de empresa está disponível
      if (!empresasService.update) {
        throw new Error('Serviço de empresas não disponível');
      }
      
      await empresasService.update(currentEmpresa.id, updatedData);
      
      // Atualizar o objeto da empresa no contexto
      const updatedEmpresa = {
        ...currentEmpresa,
        ...updatedData
      };
      setCurrentEmpresa(updatedEmpresa);
      
      setUploadState({
        uploading: false,
        progress: 100,
        message: 'Dados salvos com sucesso!'
      });
      
      setSuccess('Dados da empresa atualizados com sucesso!');
      setIsEditing(false);
      setLogoFile(null);
      setRemoveLogo(false);
    } catch (err: any) {
      console.error('Erro ao atualizar dados da empresa:', err);
      setError(`Erro ao atualizar dados da empresa: ${err.message}`);
      setUploadState({
        uploading: false,
        progress: 0,
        message: ''
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para redimensionar imagem antes do upload
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        
        // Calcular novas dimensões mantendo a proporção
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(image, 0, 0, width, height);
        
        // Converter para BLOB com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          file.type,
          0.7  // 70% de qualidade, reduz o tamanho do arquivo
        );
      };
      
      image.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  // Verifica se o usuário pode visualizar essa página
  if (!currentEmpresa) {
    return (
      <Container>
        <PageHeader 
          title="Dados da Empresa" 
          description="Gerenciamento das informações da empresa"
        />
        <ErrorMessage>
          Nenhuma empresa encontrada. Entre em contato com o administrador do sistema.
        </ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageHeader 
        title="Dados da Empresa" 
        description="Gerenciamento das informações da empresa"
      />
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <FormCard>
        <SectionTitle>Informações Gerais</SectionTitle>
        
        <FormContainer onSubmit={handleSubmit}>
          <LogoContainer>
            <Label>Logo da Empresa</Label>
            <LogoPreview>
              {logoPreview ? (
                <LogoDisplay src={logoPreview} alt="Logo da empresa" />
              ) : (
                <span>Sem logo</span>
              )}
            </LogoPreview>
            
            {isEditing && (
              <LogoUploadContainer>
                <FileInput
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={loading}
                />
                
                {uploadState.uploading && (
                  <UploadProgress>
                    <span>{uploadState.message}</span>
                    <ProgressBar>
                      <ProgressFill percentage={uploadState.progress} />
                    </ProgressBar>
                  </UploadProgress>
                )}
                
                {(logoPreview || logoFile) && (
                  <RemoveLogoButton
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={loading}
                  >
                    Remover Logo
                  </RemoveLogoButton>
                )}
              </LogoUploadContainer>
            )}
          </LogoContainer>
          
          <FormGroup>
            <Label htmlFor="nome">Nome da Empresa</Label>
            <Input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              disabled={!isEditing || loading}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleInputChange}
              disabled={!isEditing || loading}
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
              disabled={!isEditing || loading}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              disabled={!isEditing || loading}
              required
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
              disabled={!isEditing || loading}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleInputChange}
              disabled={!isEditing || loading}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="estado">Estado</Label>
            <Select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              disabled={!isEditing || loading}
              required
            >
              <option value="">Selecione um estado</option>
              {estados.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
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
              disabled={!isEditing || loading}
              required
            />
          </FormGroup>
          
          <ButtonContainer>
            {isEditing ? (
              <>
                <Button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  disabled={loading}
                  style={{ marginRight: '10px', backgroundColor: '#6c757d' }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !canEdit}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <Button 
                type="button" 
                onClick={() => setIsEditing(true)} 
                disabled={!canEdit}
              >
                Editar Informações
              </Button>
            )}
          </ButtonContainer>
        </FormContainer>
      </FormCard>
    </Container>
  );
};

export default DadosEmpresa; 