export interface ThemeType {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    light: string;
    dark: string;
    text: string;
    border: string;
    cardBackground: string;
    background: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  transitions: {
    default: string;
  };
}

// Tema padrão (claro)
export const defaultTheme: ThemeType = {
  colors: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
    text: '#212529',
    border: '#dee2e6',
    cardBackground: '#fff',
    background: '#f5f5f5',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
  transitions: {
    default: '0.3s ease',
  },
};

// Tema escuro
export const darkTheme: ThemeType = {
  colors: {
    primary: '#0D6EFD',
    secondary: '#6C757D',
    success: '#198754',
    warning: '#FFC107',
    danger: '#DC3545',
    info: '#0dcaf0',
    light: '#343A40',
    dark: '#F8F9FA',
    background: '#121212',
    cardBackground: '#1E1E1E',
    text: '#F8F9FA',
    border: '#343A40',
  },
  spacing: defaultTheme.spacing,
  borderRadius: defaultTheme.borderRadius,
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.3)',
    large: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
  transitions: defaultTheme.transitions,
};

// Função para criar temas personalizados
export function createTheme(overrides: Partial<ThemeType>): ThemeType {
  return {
    ...defaultTheme,
    ...overrides,
    colors: {
      ...defaultTheme.colors,
      ...(overrides.colors || {}),
    },
    spacing: {
      ...defaultTheme.spacing,
      ...(overrides.spacing || {}),
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      ...(overrides.borderRadius || {}),
    },
    shadows: {
      ...defaultTheme.shadows,
      ...(overrides.shadows || {}),
    },
    transitions: {
      ...defaultTheme.transitions,
      ...(overrides.transitions || {}),
    },
  };
}

export default defaultTheme; 