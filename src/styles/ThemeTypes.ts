// Definições de tipos para o tema
export interface ThemeType {
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    text: string;
    textLight: string;
    background: string;
    backgroundAlt: string;
    backgroundHover: string;
    border: string;
    light: string;
    dark: string;
    disabled: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  fontSizes: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    default: string;
  };
}

// Tema padrão
export const defaultTheme: ThemeType = {
  colors: {
    primary: '#0d6efd',
    primaryDark: '#0b5ed7',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    text: '#212529',
    textLight: '#6c757d',
    background: '#f8f9fa',
    backgroundAlt: '#e9ecef',
    backgroundHover: '#f1f3f5',
    border: '#dee2e6',
    light: '#f8f9fa',
    dark: '#212529',
    disabled: '#adb5bd'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)'
  },
  transitions: {
    default: '0.3s'
  }
}; 