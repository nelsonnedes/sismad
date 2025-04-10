/**
 * Dados mock para uso durante o desenvolvimento
 * Substitui temporariamente as chamadas ao Firebase
 */

// Coleção mockada de clientes
export const mockClientes = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@exemplo.com',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    observacoes: 'Cliente VIP'
  },
  {
    id: '2',
    nome: 'Maria Souza',
    email: 'maria.souza@exemplo.com',
    telefone: '(21) 88888-8888',
    endereco: 'Av. Modelo, 456',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-100',
    observacoes: 'Paga em dia'
  }
];

// Coleção mockada de espécies de madeira
export const mockEspecies = [
  {
    id: '1',
    nome: 'Pinus',
    nomeCientifico: 'Pinus elliottii',
    descricao: 'Madeira conífera de cor clara, macia e de baixa densidade.',
    densidade: 0.5,
    preco: 1500
  },
  {
    id: '2',
    nome: 'Eucalipto',
    nomeCientifico: 'Eucalyptus grandis',
    descricao: 'Madeira de crescimento rápido, cor rosa a castanho, resistente.',
    densidade: 0.6,
    preco: 1800
  },
  {
    id: '3',
    nome: 'Cedro',
    nomeCientifico: 'Cedrela fissilis',
    descricao: 'Madeira nobre de coloração avermelhada, aroma agradável.',
    densidade: 0.55,
    preco: 2500
  }
];

// Coleção mockada de romaneios
export const mockRomaneios = [
  {
    id: '1',
    tipo: 'TL', // Toda Largura
    numero: '2023/001',
    data: new Date('2023-01-15'),
    cliente: {
      id: '1',
      nome: 'João Silva'
    },
    valorTotal: 3245.75,
    volumeTotal: 1.85,
    observacoes: 'Entrega urgente',
    itens: [
      {
        id: '1',
        especie: {
          id: '1',
          nome: 'Pinus'
        },
        espessura: 2.5, // em cm
        largura: 15, // em cm
        comprimento: 300, // em cm
        quantidade: 5,
        valorUnitario: 120.5,
        volume: 0.56,
        valorTotal: 602.5
      },
      {
        id: '2',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        espessura: 2.5, // em cm
        largura: 20, // em cm
        comprimento: 400, // em cm
        quantidade: 10,
        valorUnitario: 135.75,
        volume: 1.29,
        valorTotal: 1357.5
      }
    ]
  },
  {
    id: '2',
    tipo: 'PC', // Pacote
    numero: '2023/002',
    data: new Date('2023-02-10'),
    cliente: {
      id: '2',
      nome: 'Maria Souza'
    },
    valorTotal: 5820.50,
    volumeTotal: 3.25,
    observacoes: 'Cliente recolhe',
    itens: [
      {
        id: '1',
        especie: {
          id: '3',
          nome: 'Cedro'
        },
        espessura: 2.0, // em cm
        largura: 10, // em cm
        comprimento: 250, // em cm
        quantidade: 15,
        valorUnitario: 155.20,
        volume: 0.75,
        valorTotal: 2328.00
      },
      {
        id: '2',
        especie: {
          id: '1',
          nome: 'Pinus'
        },
        espessura: 5.0, // em cm
        largura: 30, // em cm
        comprimento: 500, // em cm
        quantidade: 8,
        valorUnitario: 436.80,
        volume: 2.5,
        valorTotal: 3494.40
      }
    ]
  },
  {
    id: '3',
    tipo: 'TL', // Toda Largura
    numero: '2023/003',
    data: new Date('2023-03-20'),
    cliente: {
      id: '1',
      nome: 'João Silva'
    },
    valorTotal: 2145.00,
    volumeTotal: 1.1,
    observacoes: 'Madeira para móveis',
    itens: [
      {
        id: '1',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        espessura: 3.0, // em cm
        largura: 22, // em cm
        comprimento: 350, // em cm
        quantidade: 5,
        valorUnitario: 429.00,
        volume: 1.1,
        valorTotal: 2145.00
      }
    ]
  },
  {
    id: '4',
    tipo: 'PC', // Pacote
    numero: '2023/004',
    data: new Date('2023-04-05'),
    cliente: {
      id: '2',
      nome: 'Maria Souza'
    },
    valorTotal: 5975.00,
    volumeTotal: 3.5,
    observacoes: 'Aguardando disponibilidade',
    itens: [
      {
        id: '1',
        especie: {
          id: '1',
          nome: 'Pinus'
        },
        espessura: 2.0, // em cm
        largura: 10, // em cm
        comprimento: 400, // em cm
        quantidade: 25,
        valorUnitario: 115.00,
        volume: 2.0,
        valorTotal: 2875.00
      },
      {
        id: '2',
        especie: {
          id: '3',
          nome: 'Cedro'
        },
        espessura: 4.0, // em cm
        largura: 15, // em cm
        comprimento: 250, // em cm
        quantidade: 12,
        valorUnitario: 258.33,
        volume: 1.5,
        valorTotal: 3100.00
      }
    ]
  },
  {
    id: '5',
    tipo: 'TL', // Toda Largura
    numero: '2023/005',
    data: new Date('2023-04-25'),
    cliente: {
      id: '1',
      nome: 'João Silva'
    },
    valorTotal: 3800.00,
    volumeTotal: 2.2,
    observacoes: 'Entrega parcelada',
    itens: [
      {
        id: '1',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        espessura: 4.0, // em cm
        largura: 20, // em cm
        comprimento: 350, // em cm
        quantidade: 8,
        valorUnitario: 475.00,
        volume: 2.2,
        valorTotal: 3800.00
      }
    ]
  },
  {
    id: '6',
    tipo: 'TL', // Toda Largura
    numero: '2023/006',
    data: new Date('2023-05-04'),
    cliente: {
      id: '2',
      nome: 'Maria Souza'
    },
    valorTotal: 4242.88,
    volumeTotal: 3.26375,
    observacoes: 'Pagamento à vista',
    itens: [
      {
        id: '1',
        especie: {
          id: '1',
          nome: 'Pinus'
        },
        espessura: 2.5, // em cm
        largura: 16, // em cm
        comprimento: 300, // em cm
        quantidade: 5,
        valorUnitario: 291.20,
        volume: 0.6,
        valorTotal: 1456.00
      },
      {
        id: '2',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        espessura: 3.0, // em cm
        largura: 25, // em cm
        comprimento: 350, // em cm
        quantidade: 7,
        valorUnitario: 398.13,
        volume: 2.66375,
        valorTotal: 2786.88
      }
    ]
  }
];

// Coleção mockada de orçamentos
export const mockOrcamentos = [
  {
    id: '1',
    numero: 'ORC-2023/001',
    data: new Date('2023-01-10'),
    validade: new Date('2023-02-10'),
    cliente: {
      id: '1',
      nome: 'João Silva'
    },
    valorTotal: 4500.75,
    desconto: 250.00,
    valorFinal: 4250.75,
    status: 'aprovado',
    itens: [
      {
        id: '1',
        descricao: 'Tábuas de Pinus',
        especie: {
          id: '1',
          nome: 'Pinus'
        },
        quantidade: 10,
        unidade: 'm²',
        valorUnitario: 130.50,
        valorTotal: 1305.00
      },
      {
        id: '2',
        descricao: 'Ripas de Eucalipto',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        quantidade: 25,
        unidade: 'unid',
        valorUnitario: 127.83,
        valorTotal: 3195.75
      }
    ]
  },
  {
    id: '2',
    numero: 'ORC-2023/002',
    data: new Date('2023-02-15'),
    validade: new Date('2023-03-15'),
    cliente: {
      id: '2',
      nome: 'Maria Souza'
    },
    valorTotal: 6850.00,
    desconto: 0.00,
    valorFinal: 6850.00,
    status: 'pendente',
    itens: [
      {
        id: '1',
        descricao: 'Vigas de Cedro',
        especie: {
          id: '3',
          nome: 'Cedro'
        },
        quantidade: 8,
        unidade: 'unid',
        valorUnitario: 450.00,
        valorTotal: 3600.00
      },
      {
        id: '2',
        descricao: 'Caibros de Eucalipto',
        especie: {
          id: '2',
          nome: 'Eucalipto'
        },
        quantidade: 20,
        unidade: 'unid',
        valorUnitario: 162.50,
        valorTotal: 3250.00
      }
    ]
  }
];

// Função para retornar a coleção mock apropriada
export const getMockCollection = (collection: string): any[] => {
  switch (collection) {
    case 'clientes':
      return mockClientes;
    case 'especies':
      return mockEspecies;
    case 'romaneios':
      return mockRomaneios;
    case 'orcamentos':
      return mockOrcamentos;
    default:
      return [];
  }
};

// Função para excluir um item mockado
export const deleteMockItem = (collection: string, id: string): boolean => {
  let mockCollection: any[] = [];
  let mockVariable: any[] = [];

  // Selecionar a coleção correta
  switch (collection) {
    case 'clientes':
      mockCollection = mockClientes;
      mockVariable = mockClientes;
      break;
    case 'especies':
      mockCollection = mockEspecies;
      mockVariable = mockEspecies;
      break;
    case 'romaneios':
      mockCollection = mockRomaneios;
      mockVariable = mockRomaneios;
      break;
    case 'orcamentos':
      mockCollection = mockOrcamentos;
      mockVariable = mockOrcamentos;
      break;
    default:
      return false;
  }

  // Encontrar o índice do item a ser excluído
  const index = mockCollection.findIndex(item => item.id === id);
  
  if (index !== -1) {
    // Remover o item do array
    mockVariable.splice(index, 1);
    return true;
  }
  
  return false;
}; 