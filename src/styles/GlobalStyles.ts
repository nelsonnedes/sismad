import { createGlobalStyle } from 'styled-components';
import { ThemeType } from './theme';

type ThemeProps = {
  theme: ThemeType;
};

// Estilos globais da aplicação
const GlobalStyles = createGlobalStyle<ThemeProps>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: 'Poppins', sans-serif;
    background-color: ${(props: ThemeProps) => props.theme.colors.background};
    color: ${(props: ThemeProps) => props.theme.colors.text};
    line-height: 1.5;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  a {
    color: ${(props: ThemeProps) => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${(props: ThemeProps) => props.theme.transitions.default};
    
    &:hover {
      color: #0b5ed7; // Slightly darker
    }
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }
  
  button {
    cursor: pointer;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: ${(props: ThemeProps) => props.theme.spacing.medium};
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  h4 {
    font-size: 1rem;
  }
  
  h5, h6 {
    font-size: 0.875rem;
  }
  
  p {
    margin-bottom: ${(props: ThemeProps) => props.theme.spacing.medium};
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  ul, ol {
    list-style-position: inside;
    margin-bottom: ${(props: ThemeProps) => props.theme.spacing.medium};
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: ${(props: ThemeProps) => props.theme.spacing.small};
  }
  
  /* Remove arrows from number input */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

export default GlobalStyles; 