import { 
  getMockCollection,
  deleteMockItem,
  mockClientes,
  mockEspecies,
  mockRomaneios,
  mockOrcamentos
} from '../firebase/mockData';

// Importações do Firestore
import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Flag para controlar se usamos o Firestore real ou dados mockados
// Ao mudar para true, a aplicação usará o Firebase real
export const USE_REAL_FIREBASE = true;

// Utility para converter datas do Firestore
const convertFirestoreTimestamp = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertFirestoreTimestamp(item));
  }
  
  if (typeof data === 'object') {
    const result = { ...data };
    
    Object.keys(result).forEach(key => {
      const value = result[key];
      
      // Converter Timestamp para Date
      if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
        result[key] = new Date(value.seconds * 1000);
      } 
      // Recursivamente converter objetos aninhados
      else if (value && typeof value === 'object') {
        result[key] = convertFirestoreTimestamp(value);
      }
    });
    
    return result;
  }
  
  return data;
};

// Converte datas JavaScript para Timestamp do Firestore
const prepareDataForFirestore = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => prepareDataForFirestore(item));
  }
  
  if (typeof data === 'object') {
    const result = { ...data };
    
    Object.keys(result).forEach(key => {
      const value = result[key];
      
      // Converter Date para Timestamp
      if (value instanceof Date) {
        result[key] = Timestamp.fromDate(value);
      }
      // Recursivamente converter objetos aninhados
      else if (value && typeof value === 'object' && !(value instanceof Timestamp)) {
        result[key] = prepareDataForFirestore(value);
      }
    });
    
    return result;
  }
  
  return data;
};

// Tipos básicos
export interface BaseDocument {
  id: string;
}

// Definição da interface de Empresa
export interface Empresa extends BaseDocument {
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  logo?: string;
  dataCadastro: Date;
  ativa: boolean;
  configuracoes?: {
    corPrimaria?: string;
    corSecundaria?: string;
    tema?: string;
  }
}

// Definição da interface de Usuário com empresa
export interface Usuario extends BaseDocument {
  nome: string;
  email: string;
  empresaId: string; // Referência à empresa do usuário
  tipo: 'admin' | 'usuario'; // admin pode gerenciar a empresa, usuário apenas acessa
  ativo: boolean;
  dataCadastro: Date;
  ultimoAcesso?: Date;
}

// Implementação real do Firebase
const realFirebaseService = {
  // Retorna todos os documentos de uma coleção
  getAll: async <T extends BaseDocument>(collectionName: string): Promise<T[]> => {
    try {
      console.log(`Buscando todos os documentos da coleção ${collectionName} (Firebase real)`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      // @ts-ignore - Ignorar erros de tipagem aqui
      const result = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...convertFirestoreTimestamp(data) } as T;
      });
      
      console.log(`Encontrados ${result.length} documentos em ${collectionName}`);
      return result;
    } catch (error) {
      console.error(`Erro ao buscar documentos da coleção ${collectionName}:`, error);
      throw error;
    }
  },

  // Retorna um documento específico pelo ID
  getById: async <T extends BaseDocument>(collectionName: string, id: string): Promise<T | null> => {
    try {
      console.log(`Buscando documento com ID ${id} na coleção ${collectionName} (Firebase real)`);
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...convertFirestoreTimestamp(data) } as T;
      }
      
      console.log(`Documento com ID ${id} não encontrado em ${collectionName}`);
      return null;
    } catch (error) {
      console.error(`Erro ao buscar documento com ID ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Cria um novo documento
  create: async <T extends Omit<BaseDocument, 'id'>>(collectionName: string, data: T): Promise<string> => {
    try {
      // Preparar dados para o Firestore (converter datas, etc.)
      const preparedData = prepareDataForFirestore(data);
      
      console.log(`Criando novo documento na coleção ${collectionName} (Firebase real)`, preparedData);
      
      if (preparedData.id) {
        // Se já tem ID, usar setDoc
        const docRef = doc(db, collectionName, preparedData.id as string);
        await setDoc(docRef, preparedData);
        console.log(`Documento criado com ID ${preparedData.id} em ${collectionName}`);
        return preparedData.id as string;
      } else {
        // Caso contrário, usar addDoc que gera um ID automaticamente
        const docRef = await addDoc(collection(db, collectionName), preparedData);
        console.log(`Documento criado com ID ${docRef.id} em ${collectionName}`);
        return docRef.id;
      }
    } catch (error) {
      console.error(`Erro ao criar documento em ${collectionName}:`, error);
      throw error;
    }
  },

  // Atualiza um documento existente
  update: async <T extends BaseDocument>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    try {
      // Preparar dados para o Firestore (converter datas, etc.)
      const preparedData = prepareDataForFirestore(data);
      
      console.log(`Atualizando documento com ID ${id} na coleção ${collectionName} (Firebase real)`, preparedData);
      
      // Remover o ID dos dados de atualização (não queremos atualizar o ID)
      if (preparedData.id) {
        delete preparedData.id;
      }
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, preparedData as any);
      
      console.log(`Documento com ID ${id} atualizado em ${collectionName}`);
    } catch (error) {
      console.error(`Erro ao atualizar documento com ID ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Remove um documento
  delete: async (collectionName: string, id: string): Promise<void> => {
    try {
      console.log(`Excluindo documento com ID ${id} da coleção ${collectionName} (Firebase real)`);
      await deleteDoc(doc(db, collectionName, id));
      console.log(`Documento com ID ${id} excluído de ${collectionName}`);
    } catch (error) {
      console.error(`Erro ao excluir documento com ID ${id} em ${collectionName}:`, error);
      throw error;
    }
  },

  // Busca documentos com filtro
  query: async <T extends BaseDocument>(
    collectionName: string, 
    field: keyof T, 
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=', 
    value: any
  ): Promise<T[]> => {
    try {
      console.log(`Consultando documentos em ${collectionName} onde ${String(field)} ${operator} ${value} (Firebase real)`);
      
      const q = query(
        collection(db, collectionName), 
        where(String(field), operator, value)
      );
      
      const querySnapshot = await getDocs(q);
      
      // @ts-ignore - Ignorar erros de tipagem aqui
      const result = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { id: doc.id, ...convertFirestoreTimestamp(data) } as T;
      });
      
      console.log(`Encontrados ${result.length} documentos em ${collectionName} para a consulta`);
      return result;
    } catch (error) {
      console.error(`Erro na consulta da coleção ${collectionName}:`, error);
      throw error;
    }
  }
};

// Serviço que simula as operações do Firestore (versão mock existente)
const mockFirebaseService = {
  // Implemente os mesmos métodos da versão real, mas usando os dados mockados
  // A versão já existente que usa os dados mockados
  getAll: async <T extends BaseDocument>(collection: string): Promise<T[]> => {
    console.log(`Buscando todos os documentos da coleção ${collection} (Mock)`);
    return getMockCollection(collection) as unknown as T[];
  },

  getById: async <T extends BaseDocument>(collection: string, id: string): Promise<T | null> => {
    console.log(`Buscando documento com ID ${id} na coleção ${collection} (Mock)`);
    const data = getMockCollection(collection) as unknown as T[];
    const item = data.find(item => item.id === id);
    return item || null;
  },

  create: async <T extends Omit<BaseDocument, 'id'>>(collection: string, data: T): Promise<string> => {
    const id = Math.random().toString(36).substring(2, 15);
    const newItem = { id, ...data };
    console.log(`Mock create em ${collection}`, newItem);
    
    // Adicionar o item à coleção correspondente
    if (collection === 'romaneios') {
      mockRomaneios.push(newItem as any);
      console.log(`Romaneio adicionado com ID ${id}. Total de romaneios agora: ${mockRomaneios.length}`);
    } else if (collection === 'clientes') {
      mockClientes.push(newItem as any);
    } else if (collection === 'especies') {
      mockEspecies.push(newItem as any);
    } else if (collection === 'orcamentos') {
      mockOrcamentos.push(newItem as any);
    }
    
    return id;
  },

  update: async <T extends BaseDocument>(collection: string, id: string, data: Partial<T>): Promise<void> => {
    console.log(`Mock update em ${collection}`, { id });
    console.log('Dados para atualização:', JSON.stringify(data, null, 2));
    
    // Código existente para update mockado
    const collectionData = getMockCollection(collection) as unknown as any[];
    const index = collectionData.findIndex(item => item.id === id);
    
    if (index !== -1) {
      console.log('Item original antes da atualização:', JSON.stringify(collectionData[index], null, 2));
      
      // Para Romaneios, precisamos ter atenção especial com o array de itens
      if (collection === 'romaneios' && (data as any).itens) {
        console.log(`Atualizando itens do romaneio ID ${id}:`);
        console.log(`Total de itens na atualização: ${(data as any).itens.length}`);
        console.log(`Total de itens no romaneio original: ${collectionData[index].itens?.length || 0}`);
        
        // Para garantir persistência, atualizamos diretamente os dados mockados do array
        if (collection === 'romaneios') {
          try {
            // Modificar diretamente o objeto no array mockRomaneios para garantir persistência
            const romaneioIndex = mockRomaneios.findIndex(r => r.id === id);
            if (romaneioIndex !== -1) {
              // Aplicar todas as propriedades atualizadas
              mockRomaneios[romaneioIndex] = {
                ...mockRomaneios[romaneioIndex],
                ...(data as any)
              };
              
              // Garantir que os itens sejam uma nova matriz para evitar referências
              if ((data as any).itens && Array.isArray((data as any).itens)) {
                mockRomaneios[romaneioIndex].itens = [...(data as any).itens];
              }
              
              // Garantir que outros campos importantes sejam atualizados
              mockRomaneios[romaneioIndex].volumeTotal = (data as any).volumeTotal || 0;
              mockRomaneios[romaneioIndex].valorTotal = (data as any).valorTotal || 0;
              
              console.log(`Romaneio ID ${id} após atualização direta:`, mockRomaneios[romaneioIndex]);
              console.log('Itens após atualização:', mockRomaneios[romaneioIndex].itens.length);
              
              // Forçar a atualização dos dados no índice correto da coleção
              collectionData[index] = mockRomaneios[romaneioIndex];
              
              console.log('Atualização no array mockRomaneios concluída');
            }
          } catch (error) {
            console.error('Erro ao atualizar diretamente o array mockRomaneios:', error);
          }
        }
      }
      
      // Atualizar o item com os novos dados
      const updatedItem = { ...collectionData[index], ...data };
      
      // Atualizar os dados mockados
      if (collection === 'romaneios') {
        mockRomaneios[index] = updatedItem;
        console.log('Romaneio atualizado com sucesso:', mockRomaneios[index]);
        console.log(`Total de itens após atualização: ${mockRomaneios[index].itens?.length || 0}`);
      } else if (collection === 'clientes') {
        mockClientes[index] = updatedItem;
      } else if (collection === 'especies') {
        mockEspecies[index] = updatedItem;
      } else if (collection === 'orcamentos') {
        mockOrcamentos[index] = updatedItem;
      }
      
      console.log(`Item com ID ${id} atualizado na coleção ${collection}`);
    } else {
      console.warn(`Item com ID ${id} não encontrado na coleção ${collection}`);
    }
  },

  delete: async (collection: string, id: string): Promise<void> => {
    console.log(`Mock delete em ${collection}`, { id });
    const deleted = deleteMockItem(collection, id);
    if (!deleted) {
      console.warn(`Item com ID ${id} não encontrado na coleção ${collection}`);
    }
  },

  query: async <T extends BaseDocument>(
    collection: string, 
    field: keyof T, 
    operator: string, 
    value: any
  ): Promise<T[]> => {
    console.log(`Consultando documentos em ${collection} onde ${String(field)} ${operator} ${value} (Mock)`);
    const data = getMockCollection(collection) as unknown as T[];
    return data.filter(item => {
      // Implementação simplificada de operadores
      switch(operator) {
        case '==':
          return item[field] === value;
        case '!=':
          return item[field] !== value;
        case '>':
          return item[field] > value;
        case '>=':
          return item[field] >= value;
        case '<':
          return item[field] < value;
        case '<=':
          return item[field] <= value;
        default:
          return true;
      }
    });
  }
};

// Exportar o serviço correto com base na flag USE_REAL_FIREBASE
export const firebaseService = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;

/**
 * Migra dados mockados para o Firebase
 * @returns Resultado da migração
 */
export const migrateDataToFirebase = async () => {
  try {
    // Verificar se o Firebase está vazio antes de migrar
    const status = await checkFirebaseData();
    
    if (!status.isEmpty) {
      return {
        success: false,
        message: 'O Firebase já contém dados. A migração só pode ser executada em um banco de dados vazio.'
      };
    }
    
    // Forçar o uso de Firebase real para a migração
    // Armazenar a flag atual para restaurar depois
    const originalUseRealFirebase = USE_REAL_FIREBASE;
    
    try {
      // Criar uma instância temporária do serviço do Firebase real
      const tempRealService = realFirebaseService;
      
      // Migrar cada tipo de dados
      console.log(`Iniciando migração de ${mockClientes.length} clientes...`);
      const clientesMigrated = await migrateCollection(tempRealService, 'clientes', mockClientes);
      
      console.log(`Iniciando migração de ${mockEspecies.length} espécies...`);
      const especiesMigrated = await migrateCollection(tempRealService, 'especies', mockEspecies);
      
      console.log(`Iniciando migração de ${mockRomaneios.length} romaneios...`);
      const romaneiosMigrated = await migrateCollection(tempRealService, 'romaneios', mockRomaneios);
      
      console.log(`Iniciando migração de ${mockOrcamentos.length} orçamentos...`);
      const orcamentosMigrated = await migrateCollection(tempRealService, 'orcamentos', mockOrcamentos);
      
      console.log('Migração de dados concluída com sucesso!');
      
      return {
        success: true,
        counts: {
          clientes: clientesMigrated,
          especies: especiesMigrated,
          romaneios: romaneiosMigrated,
          orcamentos: orcamentosMigrated
        }
      };
    } finally {
      // Não é necessário restaurar nada, já que não modificamos a flag global
    }
  } catch (error) {
    console.error('Erro durante a migração:', error);
    return {
      success: false,
      message: `Erro durante a migração: ${error}`
    };
  }
};

/**
 * Migra uma coleção para o Firebase
 * @param service Serviço Firebase real
 * @param collectionName Nome da coleção
 * @param items Array de itens a serem migrados
 * @returns Número de itens migrados
 */
const migrateCollection = async (
  service: typeof realFirebaseService,
  collectionName: string, 
  items: any[]
): Promise<number> => {
  try {
    let migratedCount = 0;
    
    for (const item of items) {
      // Criar uma cópia do item para evitar referências
      const itemCopy = JSON.parse(JSON.stringify(item));
      const id = itemCopy.id;
      
      try {
        // Usar o método de criação com ID específico em vez de setDoc diretamente
        await service.create(collectionName, itemCopy);
        console.log(`Item com ID ${id} migrado para ${collectionName}`);
        migratedCount++;
      } catch (error) {
        console.error(`Erro ao migrar item ${id} da coleção ${collectionName}:`, error);
      }
    }
    
    return migratedCount;
  } catch (error) {
    console.error(`Erro ao migrar coleção ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Obtém a contagem de documentos em uma coleção
 * @param collectionName Nome da coleção
 * @returns Contagem de documentos
 */
const getCollectionCount = async (collectionName: string): Promise<number> => {
  try {
    // Se estamos usando dados mockados, retorne 0
    if (!USE_REAL_FIREBASE) {
      return 0;
    }
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.size;
  } catch (error) {
    console.error(`Erro ao contar documentos em ${collectionName}:`, error);
    return 0;
  }
};

// Verificar se os dados reais existem no Firebase
export const checkFirebaseData = async () => {
  try {
    // Obter contagens de documentos nas coleções
    const clientesCount = await getCollectionCount('clientes');
    const especiesCount = await getCollectionCount('especies');
    const romaneiosCount = await getCollectionCount('romaneios');
    const orcamentosCount = await getCollectionCount('orcamentos');
    
    // Determinar se o banco está vazio
    const isEmpty = 
      clientesCount === 0 && 
      especiesCount === 0 && 
      romaneiosCount === 0 && 
      orcamentosCount === 0;
    
    return {
      clientesCount,
      especiesCount,
      romaneiosCount,
      orcamentosCount,
      isEmpty
    };
  } catch (error) {
    console.error('Erro ao verificar dados do Firebase:', error);
    throw error;
  }
};

// Interfaces para os tipos de documentos
export interface Cliente extends BaseDocument {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
  empresaId: string; // Adicionado campo para referência à empresa
}

export interface Especie extends BaseDocument {
  nome: string;
  nomeCientifico: string;
  densidade: string;
  categoria: string;
  descricao: string;
  ativo: boolean;
  empresaId: string; // Adicionado campo para referência à empresa
}

export interface RomaneioTLItem {
  numero: number;
  largura: number;
  espessura: number;
  comprimento: number;
  quantidade: number;
  volume: number;
}

export interface RomaneioPCItem {
  numero: number;
  largura: number;
  altura: number;
  comprimento: number;
  quantidade: number;
  pecasPorPacote: number;
  volume: number;
}

export interface Romaneio extends BaseDocument {
  tipo: string;
  cliente: string;
  especie: string;
  data: Date;
  numero: string;
  itens: RomaneioTLItem[] | RomaneioPCItem[];
  volumeTotal: number;
  dataCriacao: Date;
  empresaId: string; // Adicionado campo para referência à empresa
}

export interface OrcamentoItem {
  id: number;
  descricao: string;
  especie: string;
  quantidade: number;
  unidade: string;
  largura: number;
  altura: number;
  comprimento: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Orcamento extends BaseDocument {
  cliente: string;
  dataOrcamento: Date;
  dataValidade: Date;
  numero: string;
  observacoes: string;
  formaPagamento: string;
  prazoEntrega: string;
  itens: OrcamentoItem[];
  valorTotal: number;
  status: string;
  dataCriacao: Date;
  empresaId: string; // Adicionado campo para referência à empresa
}

// Serviços específicos para cada coleção
export const clientesService = {
  getAll: () => firebaseService.getAll<Cliente>('clientes'),
  getById: (id: string) => firebaseService.getById<Cliente>('clientes', id),
  create: async (data: Omit<Cliente, 'id'> & { empresaId: string }): Promise<string> => {
    const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
    return service.create<Omit<Cliente, 'id'>>('clientes', data);
  },
  update: (id: string, data: Partial<Cliente>) => firebaseService.update('clientes', id, data),
  delete: (id: string) => firebaseService.delete('clientes', id),
  getByEmpresa: async (empresaId: string): Promise<Cliente[]> => {
    const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
    
    if (USE_REAL_FIREBASE) {
      return service.query<Cliente>('clientes', 'empresaId' as keyof Cliente, '==', empresaId);
    } else {
      // Mock implementation
      const clientes = await service.getAll<Cliente>('clientes');
      return clientes.filter(c => c.empresaId === empresaId);
    }
  }
};

export const especiesService = {
  getAll: () => firebaseService.getAll<Especie>('especies'),
  getById: (id: string) => firebaseService.getById<Especie>('especies', id),
  create: (data: Omit<Especie, 'id'>) => firebaseService.create('especies', data),
  update: (id: string, data: Partial<Especie>) => firebaseService.update('especies', id, data),
  delete: (id: string) => firebaseService.delete('especies', id)
};

export const romaneiosService = {
  getAll: () => firebaseService.getAll<Romaneio>('romaneios'),
  getById: (id: string) => firebaseService.getById<Romaneio>('romaneios', id),
  create: (data: Omit<Romaneio, 'id'>) => firebaseService.create('romaneios', data),
  update: (id: string, data: Partial<Romaneio>) => firebaseService.update('romaneios', id, data),
  delete: (id: string) => firebaseService.delete('romaneios', id),
  getByTipo: async (tipo: string) => {
    // Busca todos os romaneios
    const romaneios = await firebaseService.getAll<Romaneio>('romaneios');
    console.log(`Buscando romaneios do tipo: ${tipo}`);
    console.log(`Total de romaneios encontrados: ${romaneios.length}`);
    
    // Filtra os romaneios pelo tipo (case insensitive)
    const filtrados = romaneios.filter(romaneio => {
      const romaneioTipo = romaneio.tipo ? romaneio.tipo.toLowerCase() : '';
      const match = romaneioTipo === tipo.toLowerCase();
      console.log(`Romaneio ID: ${romaneio.id}, tipo: ${romaneioTipo}, match: ${match}`);
      return match;
    });
    
    console.log(`Total de romaneios filtrados por tipo ${tipo}: ${filtrados.length}`);
    return filtrados;
  }
};

export const orcamentosService = {
  getAll: () => firebaseService.getAll<Orcamento>('orcamentos'),
  getById: (id: string) => firebaseService.getById<Orcamento>('orcamentos', id),
  create: (data: Omit<Orcamento, 'id'>) => firebaseService.create('orcamentos', data),
  update: (id: string, data: Partial<Orcamento>) => firebaseService.update('orcamentos', id, data),
  delete: (id: string) => firebaseService.delete('orcamentos', id),
  getByStatus: (status: string) => 
    firebaseService.query<Orcamento>('orcamentos', 'status', '==', status)
};

// Serviço para empresas
export const empresasService = USE_REAL_FIREBASE
  ? {
      getAll: () => realFirebaseService.getAll<Empresa>('empresas'),
      getById: (id: string) => realFirebaseService.getById<Empresa>('empresas', id),
      create: (data: Omit<Empresa, 'id'>) => realFirebaseService.create<Omit<Empresa, 'id'>>('empresas', data),
      update: (id: string, data: Partial<Empresa>) => realFirebaseService.update<Empresa>('empresas', id, data),
      delete: (id: string) => realFirebaseService.delete('empresas', id)
    }
  : {
      // Mock implementation
      // ... existng code
    };

// Serviço para usuários
export const usuariosService = USE_REAL_FIREBASE
  ? {
      getAll: async (): Promise<Usuario[]> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        return service.getAll<Usuario>('usuarios');
      },

      getById: async (id: string): Promise<Usuario | null> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        return service.getById<Usuario>('usuarios', id);
      },

      getByEmail: async (email: string): Promise<Usuario | null> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        
        if (USE_REAL_FIREBASE) {
          try {
            const usuarios = await service.query<Usuario>('usuarios', 'email' as keyof Usuario, '==', email);
            return usuarios.length > 0 ? usuarios[0] : null;
          } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            return null;
          }
        } else {
          // Mock implementation
          const usuarios = await service.getAll<Usuario>('usuarios');
          return usuarios.find(u => u.email === email) || null;
        }
      },

      getByEmpresaId: async (empresaId: string): Promise<Usuario[]> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        
        if (USE_REAL_FIREBASE) {
          return service.query<Usuario>('usuarios', 'empresaId' as keyof Usuario, '==', empresaId);
        } else {
          // Mock implementation
          const usuarios = await service.getAll<Usuario>('usuarios');
          return usuarios.filter(u => u.empresaId === empresaId);
        }
      },

      create: async (data: Omit<Usuario, 'id'>): Promise<string> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        
        // Garantir que a data de cadastro seja definida
        const usuarioData = {
          ...data,
          dataCadastro: data.dataCadastro || new Date(),
          ativo: data.ativo !== undefined ? data.ativo : true
        };
        
        return service.create<Omit<Usuario, 'id'>>('usuarios', usuarioData);
      },

      update: async (id: string, data: Partial<Usuario>): Promise<void> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        return service.update<Usuario>('usuarios', id, data);
      },

      delete: async (id: string): Promise<void> => {
        const service = USE_REAL_FIREBASE ? realFirebaseService : mockFirebaseService;
        return service.delete('usuarios', id);
      }
    }
  : {
      // Mock implementation
      // ... existing code
    };

// Verifica e cria um usuário administrador se necessário
export const checkAndCreateInitialAdmin = async () => {
  if (!USE_REAL_FIREBASE) return;
  
  try {
    // Verificar se existe usuário admin@sismad.com
    const adminSnapshot = await getDocs(
      query(collection(db, 'usuarios'), where('email', '==', 'admin@sismad.com'))
    );
    
    if (adminSnapshot.empty) {
      console.log('Usuário administrador não encontrado, criando...');
      
      // Criar empresa padrão de teste primeiro
      const empresaData: Omit<Empresa, 'id'> = {
        nome: 'SISMAD Demo',
        cnpj: '00.000.000/0001-00',
        endereco: 'Av. Exemplo, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '00000-000',
        telefone: '(11) 1234-5678',
        email: 'contato@sismad.com',
        dataCadastro: new Date(),
        ativa: true,
        configuracoes: {
          corPrimaria: '#0d6efd',
          corSecundaria: '#6c757d',
          tema: 'light'
        }
      };
      
      // Criar a empresa
      const empresaId = await empresasService.create(empresaData);
      console.log('Empresa de demonstração criada com ID:', empresaId);
      
      // Criar o usuário administrador
      const usuarioData: Omit<Usuario, 'id'> = {
        nome: 'Administrador',
        email: 'admin@sismad.com',
        empresaId,
        tipo: 'admin',
        ativo: true,
        dataCadastro: new Date()
      };
      
      await usuariosService.create(usuarioData);
      console.log('Usuário administrador criado com sucesso');
      
      return {
        success: true,
        message: 'Usuário administrador e empresa de demonstração criados com sucesso'
      };
    }
    
    return {
      success: true,
      message: 'Usuário administrador já existe'
    };
  } catch (error) {
    console.error('Erro ao verificar/criar usuário administrador:', error);
    return {
      success: false,
      message: `Erro ao verificar/criar usuário administrador: ${error}`
    };
  }
}; 