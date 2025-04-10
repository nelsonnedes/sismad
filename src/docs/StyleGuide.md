# Guia de Estilo do SISMAD

Este documento descreve os padrões de estilo e componentes reutilizáveis para manter a consistência visual em todo o sistema.

## Cabeçalhos de Página (PageHeader)

Todas as páginas devem usar o componente `PageHeader` para manter uma tarja azul padronizada no topo da página.

### Como usar

```tsx
import PageHeader from '../../components/PageHeader';

// Dentro do componente:
<PageHeader 
  title="Título da Página"
  description="Uma breve descrição sobre o que esta página faz."
/>
```

### Estrutura das páginas

Todas as páginas devem seguir esta estrutura básica:

```tsx
import React from 'react';
import styled from 'styled-components';
import PageHeader from '../../components/PageHeader';

// Componentes estilizados
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.large};
`;

// Componente principal
const MinhaNovaFuncionalidade: React.FC = () => {
  return (
    <Container>
      <PageHeader 
        title="Título da Página"
        description="Uma breve descrição sobre o que esta página faz."
      />
      
      {/* Conteúdo da página */}
    </Container>
  );
};

export default MinhaNovaFuncionalidade;
```

## Seções dentro da página

Para manter o estilo consistente dentro das páginas, use o padrão de cartões (cards) para separar seções:

```tsx
const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.large};
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.primary};
`;

// Uso:
<Card>
  <SectionTitle>Título da Seção</SectionTitle>
  {/* Conteúdo da seção */}
</Card>
```

## Botões e Ações

Mantenha um estilo consistente para botões em todo o sistema:

```tsx
const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #0b5ed7;
    transform: translateY(-2px);
  }
`;
``` 