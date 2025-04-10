# SISMAD - Sistema para Madeireiras

Sistema de gestão para empresas que trabalham com madeira serrada, com funcionalidades de controle de estoque, orçamentos, romaneios e relatórios.

## Visão Geral

SISMAD é uma aplicação web desenvolvida para atender às necessidades de empresas que trabalham com madeira serrada, oferecendo ferramentas para controle de estoque, orçamentos, romaneios (documentos de transporte) e relatórios gerenciais. O sistema foi projetado com foco na facilidade de uso e na precisão dos cálculos de volumes em metros cúbicos.

## Principais Características

- Layout responsivo, adaptável a diferentes dispositivos
- Sistema de temas padronizado e personalizável
- Integração com banco de dados Firebase para armazenamento e autenticação
- Sistema seguro de autenticação e controle de acesso
- Interface moderna e intuitiva
- Cálculos precisos de volumes em metros cúbicos para diferentes tipos de madeira

## Módulos do Sistema

- **Dashboard**: Visão geral das informações mais importantes do sistema
- **Cadastros**: Gerenciamento de clientes, espécies de madeira e outros dados cadastrais
- **Orçamentos**: Criação e gestão de orçamentos para clientes
- **Romaneios**: Documentos de transporte e entrega de madeira
  - Romaneio Toda Largura (TL): para peças de madeira de largura variável
  - Romaneio Pacote (PC): para pacotes de madeira
  - Romaneio Cubagem em Pés (PES): para medidas em pés
  - Romaneio Toras (TR): para toras de madeira
- **Relatórios**: Geração de relatórios gerenciais e operacionais
- **Configurações**: Personalização do sistema e configurações de usuário

## Tecnologias Utilizadas

- **React.js com TypeScript**: para o desenvolvimento da interface de usuário
- **Styled Components**: para estilização dos componentes e sistema de temas
- **Firebase**: para banco de dados, autenticação e armazenamento
- **React Router**: para gerenciamento de rotas da aplicação
- **Context API**: para gerenciamento de estado global

## Execução do Projeto

### Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/sismad.git
   ```

2. Acesse a pasta do projeto:
   ```
   cd sismad/sismad-app
   ```

3. Instale as dependências:
   ```
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```
   npm start
   ```

5. Acesse o sistema no navegador:
   ```
   http://localhost:3000
   ```

### Estrutura de Pastas

```
sismad-app/
├── public/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── cadastros/    # Páginas de cadastros
│   │   └── romaneios/    # Páginas de romaneios
│   ├── services/         # Serviços e APIs
│   ├── styles/           # Estilos e temas
│   ├── utils/            # Funções utilitárias
│   ├── firebase/         # Configuração e integração com Firebase
│   ├── App.tsx           # Componente principal
│   └── index.tsx         # Ponto de entrada
└── package.json
```

## Status de Implementação

Atualmente o sistema tem implementado:

- [x] Sistema de temas com Styled Components
- [x] Layout padrão com Sidebar e Topbar
- [x] Estrutura de rotas com React Router
- [x] Integração com Firebase (configuração e mock)
- [x] Dashboard com cards informativos
- [x] Página de Romaneio TL (Toda Largura)
- [x] Página de Romaneio PC (Pacote)
- [x] Utilitários para cálculo de madeira
- [x] Serviços para acesso ao banco de dados

Pendente de implementação:

- [ ] Página de Romaneio PES (Cubagem em Pés)
- [ ] Página de Romaneio TR (Toras)
- [ ] Páginas de Cadastro de Clientes
- [ ] Páginas de Cadastro de Espécies
- [ ] Páginas de Orçamentos
- [ ] Sistema de autenticação completo
- [ ] Configurações do sistema
- [ ] Relatórios
- [ ] Gráficos na página de Dashboard

## Contribuição

Para contribuir com o projeto, siga estas etapas:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Componentes Reutilizáveis

### PageHeader
O `PageHeader` é um componente que cria uma tarja azul no topo de cada página, com título e descrição. Deve ser usado em todas as páginas para manter a consistência visual do sistema.

```tsx
<PageHeader 
  title="Título da Página"
  description="Uma breve descrição da funcionalidade da página."
/>
```

Para mais detalhes sobre a implementação dos componentes, consulte:
- `src/docs/StyleGuide.md` - Documentação visual e guia de estilos
- `CONTRIBUTING.md` - Guia para novos desenvolvedores
