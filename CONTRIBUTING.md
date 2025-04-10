# Guia de Contribuição para o SISMAD

## Estilo de Código e Padrões de Design

Para manter a consistência visual em toda a aplicação, siga estas convenções:

### 1. Cabeçalho de Página

Todas as páginas devem utilizar o componente `PageHeader` para criar a tarja azul no topo:

```tsx
import PageHeader from '../../components/PageHeader';

// Dentro do componente:
<PageHeader 
  title="Título da Página"
  description="Uma breve descrição sobre o que esta página faz."
/>
```

### 2. Estrutura de Páginas

Siga esta estrutura básica para todas as novas páginas:

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

### 3. Estrutura do Formulário e Cards

Use cards para separar seções diferentes na página:

```tsx
const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
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
<FormCard>
  <SectionTitle>Informações do Formulário</SectionTitle>
  {/* Conteúdo do formulário */}
</FormCard>
```

### 4. Avisos de Linter sobre Tipagem 'any'

É comum encontrar avisos de linter relacionados a tipagem implícita 'any' ao usar o styled-components, como este:

```
The binding element 'theme' implicitly has an 'any' type.
```

Estes avisos têm severidade baixa (nível 1) e não afetam a funcionalidade do código. Para corrigi-los, você pode:

1. Importar e utilizar o tipo `ThemeType` em seus componentes:
```tsx
import { ThemeType } from '../../styles/theme';

interface StyledProps {
  theme: ThemeType;
}

const MyStyledComponent = styled.div`
  color: ${(props: StyledProps) => props.theme.colors.primary};
`;
```

2. Ou utilize a sintaxe de objeto desestruturado com tipo explícito:
```tsx
const MyStyledComponent = styled.div`
  color: ${({ theme }: { theme: ThemeType }) => theme.colors.primary};
`;
```

Consulte o arquivo `src/docs/StyleGuide.md` para mais detalhes e exemplos sobre o estilo visual da aplicação. 