import 'styled-components';
import { ThemeType } from './theme';

// Estendendo o módulo styled-components para incluir nossa definição de tema
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
} 