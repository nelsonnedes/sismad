// Esse arquivo faz declarações de tipo para módulos externos
// para evitar erros de linter em ambiente de desenvolvimento

declare module 'styled-components';
declare module 'react-router-dom';
declare module 'firebase/app';
declare module 'firebase/firestore';
declare module 'firebase/auth';
declare module 'firebase/analytics';

// Declaração para arquivos SVG
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Declaração para arquivos de imagem
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif'; 