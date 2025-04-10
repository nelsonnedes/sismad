/**
 * Utility functions for page navigation and information
 */

/**
 * Returns the title for a given page path
 * @param path The current route path
 * @returns The page title string
 */
export const getPageTitle = (path: string): string => {
  // Remove trailing slash if present
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // Dashboard
  if (normalizedPath === '/' || normalizedPath === '/dashboard') {
    return 'Dashboard';
  }
  
  // Clientes section
  if (normalizedPath.includes('/clientes')) {
    if (normalizedPath.includes('/novo')) return 'Novo Cliente';
    if (normalizedPath.includes('/editar')) return 'Editar Cliente';
    if (normalizedPath.includes('/lista')) return 'Lista de Clientes';
    return 'Clientes';
  }
  
  // Orçamentos section
  if (normalizedPath.includes('/orcamentos')) {
    if (normalizedPath.includes('/novo')) return 'Novo Orçamento';
    if (normalizedPath.includes('/editar')) return 'Editar Orçamento';
    if (normalizedPath.includes('/visualizar')) return 'Visualizar Orçamento';
    if (normalizedPath.includes('/lista')) return 'Lista de Orçamentos';
    return 'Orçamentos';
  }
  
  // Romaneios section
  if (normalizedPath.includes('/romaneios')) {
    if (normalizedPath.includes('/tl')) return 'Romaneio Tábua/Lâmina';
    if (normalizedPath.includes('/pc')) return 'Romaneio Pacote';
    if (normalizedPath.includes('/pes')) return 'Romaneio Peso';
    if (normalizedPath.includes('/tr')) return 'Romaneio Toras';
    if (normalizedPath.includes('/lista')) return 'Lista de Romaneios';
    return 'Romaneios';
  }
  
  // Espécies section
  if (normalizedPath.includes('/especies')) {
    if (normalizedPath.includes('/nova')) return 'Nova Espécie';
    if (normalizedPath.includes('/editar')) return 'Editar Espécie';
    if (normalizedPath.includes('/lista')) return 'Lista de Espécies';
    return 'Espécies';
  }
  
  // Configurações section
  if (normalizedPath.includes('/configuracoes')) {
    if (normalizedPath.includes('/empresa')) return 'Dados da Empresa';
    if (normalizedPath.includes('/perfil')) return 'Perfil do Usuário';
    if (normalizedPath.includes('/usuarios')) return 'Usuários';
    return 'Configurações';
  }
  
  // Default fallback
  return 'SISMAD';
};

/**
 * Returns the icon name for a given page path
 * @param path The current route path
 * @returns The icon name string
 */
export const getPageIcon = (path: string): string => {
  // Remove trailing slash if present
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // Dashboard
  if (normalizedPath === '/' || normalizedPath === '/dashboard') {
    return 'dashboard';
  }
  
  // Clientes section
  if (normalizedPath.includes('/clientes')) {
    return 'person';
  }
  
  // Orçamentos section
  if (normalizedPath.includes('/orcamentos')) {
    return 'description';
  }
  
  // Romaneios section
  if (normalizedPath.includes('/romaneios')) {
    return 'list_alt';
  }
  
  // Espécies section
  if (normalizedPath.includes('/especies')) {
    return 'eco';
  }
  
  // Configurações section
  if (normalizedPath.includes('/configuracoes')) {
    return 'settings';
  }
  
  // Default fallback
  return 'home';
}; 