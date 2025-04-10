# SISMAD - Sistema de Gestão Para o Segmento Madeireiro

## 📋 Descrição
SISMAD é um sistema web desenvolvido para gestão completa de empresas do segmento madeireiro. O sistema oferece funcionalidades para controle de romaneios, orçamentos, cadastro de clientes e espécies de madeira, além de relatórios detalhados.

## 🚀 Funcionalidades Principais

- **Romaneios**
  - Romaneio Toda Largura (TL)
  - Romaneio Pacote (PC)
  - Romaneio Peso (PES)
  - Impressão de romaneios com diferentes formatos
  - Resumos por espécie e tipo de bitola

- **Orçamentos**
  - Criação e gestão de orçamentos
  - Cálculos automáticos de volume e valores
  - Impressão de orçamentos

- **Cadastros**
  - Gestão de clientes
  - Cadastro de espécies de madeira
  - Controle de usuários

## 💻 Requisitos do Sistema

- Node.js 16.x ou superior
- NPM 8.x ou superior
- Navegador web moderno (Chrome, Firefox, Edge)
- Conexão com internet para acesso ao Firebase

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/nelsonnedes/sismad.git
```

2. Acesse o diretório do projeto:
```bash
cd sismad
```

3. Instale as dependências:
```bash
npm install
```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as configurações do Firebase:
```env
REACT_APP_FIREBASE_API_KEY=sua_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

5. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 📦 Estrutura do Projeto

```
sismad/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços e integrações
│   ├── utils/         # Funções utilitárias
│   └── App.tsx        # Componente principal
├── public/            # Arquivos públicos
└── package.json       # Dependências e scripts
```

## 🔧 Configuração

### Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Authentication e o Firestore
3. Configure as regras de segurança do Firestore
4. Adicione as credenciais no arquivo `.env`

### Impressão

O sistema utiliza templates HTML personalizados para impressão. Os arquivos de template estão localizados em:
- `src/components/romaneios/PrintRomaneio.tsx`
- `src/components/orcamentos/PrintOrcamento.tsx`

## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- Desenvolvido por Nelson Brito
- Contribuidores e usuários do sistema

## 📞 Suporte

Para suporte e dúvidas, entre em contato através do GitHub ou envie um e-mail para [seu-email@exemplo.com].

---
⌨️ com ❤️ por [Nelson Brito](https://github.com/nelsonnedes)
