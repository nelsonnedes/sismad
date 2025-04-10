/**
 * Utilitários para impressão de documentos no SISMAD
 */

// Armazena identificadores das impressões recentes para evitar duplicação
const recentPrintIds: Set<string> = new Set();

// Armazena timestamps para limpar cache antigo
const printTimestamps: Map<string, number> = new Map();

// Flag global para controlar se há uma impressão em andamento
let isPrintingInProgress = false;

// Timeout para limpar a flag global após um tempo
let printingTimeout: number | null = null;

/**
 * Opções para impressão de romaneios
 */
export enum PrintOptions {
  COMPLETE = 'COMPLETE', // Impressão completa com todos os dados
  NO_UNIT_PRICE = 'NO_UNIT_PRICE', // Sem exibir preço unitário
  NO_PRICE = 'NO_PRICE' // Sem exibir nenhum preço (nem unitário nem total)
}

/**
 * Interface com os dados da empresa para impressão
 */
export interface CompanyData {
  logo?: string | null;
  nome?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
}

/**
 * Formata conteúdo para impressão em uma nova janela
 * @param content Conteúdo HTML a ser impresso
 * @param title Título para a página de impressão
 */
export function printContent(content: string, title: string): void {
  // Verificar se já há uma impressão em andamento
  if (isPrintingInProgress) {
    console.log('Bloqueando impressão concorrente - já existe uma impressão em andamento');
    return;
  }
  
  // Ativar o bloqueio global
  isPrintingInProgress = true;
  
  // Configurar limpeza automática do bloqueio após 5 segundos (segurança)
  if (printingTimeout) {
    window.clearTimeout(printingTimeout);
  }
  
  printingTimeout = window.setTimeout(() => {
    isPrintingInProgress = false;
    printingTimeout = null;
  }, 5000);
  
  // Limpar IDs de impressão antigos (mais de 10 segundos)
  const now = Date.now();
  printTimestamps.forEach((timestamp, id) => {
    if (now - timestamp > 10000) {
      recentPrintIds.delete(id);
      printTimestamps.delete(id);
    }
  });
  
  // Criar uma assinatura para esta impressão
  // Usando um hash mais específico baseado no conteúdo + título + timestamp
  const contentSignature = content.length.toString() + content.slice(0, 50);
  const printId = `${title}-${contentSignature}`;
  
  // Verificar se esta impressão já foi realizada recentemente
  if (recentPrintIds.has(printId)) {
    console.log('Impressão duplicada bloqueada:', printId);
    isPrintingInProgress = false;
    return;
  }
  
  // Adicionar o ID à lista de impressões recentes
  recentPrintIds.add(printId);
  printTimestamps.set(printId, now);
  
  try {
    // Criar uma nova janela com um nome único
    const windowName = `print_${Date.now()}`;
    const printWindow = window.open('', windowName, 'height=600,width=800');
    
    if (!printWindow) {
      alert('Por favor, permita popups para este site para imprimir o documento.');
      isPrintingInProgress = false;
    return;
  }
  
  // Definir o conteúdo da página
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 18px;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
          }
          .totals {
            margin-top: 20px;
            text-align: right;
          }
          .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin-top: 10px;
            text-align: center;
          }
          .no-print-button {
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          @media print {
            .no-print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="no-print-button" onclick="window.print(); window.close();">Imprimir</button>
        ${content}
      </body>
    </html>
  `);
  
  // Fechar o documento para finalizar a gravação
  printWindow.document.close();
    
    // Adicionar um handler para detectar quando a janela é fechada
    printWindow.onbeforeunload = () => {
      // Liberar o bloqueio global quando a janela for fechada
      isPrintingInProgress = false;
      if (printingTimeout) {
        window.clearTimeout(printingTimeout);
        printingTimeout = null;
      }
    };
  } catch (error) {
    console.error('Erro ao abrir janela de impressão:', error);
    isPrintingInProgress = false;
  }
}

// Função auxiliar para tentar obter empresa do contexto atual ou documento
function getCurrentEmpresaFromDOM(): CompanyData | null {
  try {
    console.log('Tentando extrair dados da empresa do DOM...');
    
    // Tentar encontrar elementos que possam conter informações da empresa
    const companyNameElement = document.querySelector('.company-name, .empresa-nome, header .nome-empresa, .app-header .nome-empresa');
    const companyLogoElement = document.querySelector('.company-logo img, .empresa-logo img, header .logo img, .app-header .logo img');
    
    if (companyNameElement || companyLogoElement) {
      console.log('Elementos da empresa encontrados no DOM!');
      
      const companyData: CompanyData = {};
      
      if (companyNameElement && companyNameElement.textContent) {
        companyData.nome = companyNameElement.textContent.trim();
      }
      
      if (companyLogoElement && companyLogoElement instanceof HTMLImageElement) {
        companyData.logo = companyLogoElement.src;
      }
      
      console.log('Dados extraídos do DOM:', companyData);
      return companyData;
    }
    
    // Procurar também por elementos de dados da empresa que possam estar ocultos
    const hiddenDataElement = document.querySelector('#empresa-data, [data-empresa]');
    if (hiddenDataElement) {
      const dataString = hiddenDataElement.getAttribute('data-empresa') || hiddenDataElement.textContent;
      if (dataString) {
        try {
          const parsedData = JSON.parse(dataString);
          console.log('Dados ocultos encontrados:', parsedData);
          return parsedData as CompanyData;
        } catch (e) {
          console.log('Erro ao fazer parse dos dados ocultos:', e);
        }
      }
    }
    
    console.log('Nenhum dado da empresa encontrado no DOM');
    return null;
  } catch (error) {
    console.error('Erro ao extrair dados da empresa do DOM:', error);
    return null;
  }
}

/**
 * Obtém os dados da empresa para impressão
 * @returns Dados da empresa atual ou objeto vazio se não houver
 */
export function getCompanyData(): CompanyData {
  try {
    console.log('Obtendo dados da empresa para impressão...');
    
    // Verificar se há informações da empresa no localStorage
    const empresaData = localStorage.getItem('currentEmpresa');
    console.log('localStorage currentEmpresa:', empresaData);
    
    if (empresaData) {
      try {
        const empresa = JSON.parse(empresaData);
        console.log('Dados da empresa encontrados:', empresa);
        
        return {
          logo: empresa.logo || null,
          nome: empresa.nome || '',
          cnpj: empresa.cnpj || '',
          endereco: empresa.endereco || '',
          cidade: empresa.cidade || '',
          estado: empresa.estado || '',
          telefone: empresa.telefone || ''
        };
      } catch (parseError) {
        console.error('Erro ao fazer parse dos dados da empresa:', parseError);
      }
    } else {
      console.log('Nenhum dado da empresa encontrado no localStorage');
      
      // Fallback: tentar buscar da sessionStorage
      const sessionEmpresaData = sessionStorage.getItem('currentEmpresa');
      console.log('sessionStorage currentEmpresa:', sessionEmpresaData);
      
      if (sessionEmpresaData) {
        try {
          const empresa = JSON.parse(sessionEmpresaData);
          console.log('Dados da empresa encontrados na sessionStorage:', empresa);
          
          return {
            logo: empresa.logo || null,
            nome: empresa.nome || '',
            cnpj: empresa.cnpj || '',
            endereco: empresa.endereco || '',
            cidade: empresa.cidade || '',
            estado: empresa.estado || '',
            telefone: empresa.telefone || ''
          };
        } catch (parseError) {
          console.error('Erro ao fazer parse dos dados da empresa da sessionStorage:', parseError);
        }
      }
      
      // Fallback 2: tentar buscar do DOM atual
      const domCompanyData = getCurrentEmpresaFromDOM();
      if (domCompanyData) {
        console.log('Usando dados da empresa do DOM');
        return domCompanyData;
      }
    }
    
    console.log('Retornando objeto vazio para dados da empresa');
    return {};
  } catch (error) {
    console.error('Erro ao obter dados da empresa:', error);
    return {};
  }
}

/**
 * Obtém a URL da logo da empresa para impressão
 * @returns URL da logo da empresa atual ou null se não houver
 * @deprecated Use getCompanyData() em vez disso
 */
export function getCompanyLogo(): string | null {
  const companyData = getCompanyData();
  return companyData.logo || null;
}

/**
 * Gera cabeçalho comum para impressão de documentos
 * @param title Título do documento
 * @param logoUrl URL do logo da empresa (opcional)
 * @param companyData Dados da empresa (opcional)
 */
export function generateHeader(title: string, logoUrl?: string, companyData?: CompanyData): string {
  console.log('generateHeader: Iniciando geração de cabeçalho');
  console.log('generateHeader: Params - title:', title, 'logoUrl:', logoUrl);
  console.log('generateHeader: companyData recebido:', companyData);
  
  // Se não foi fornecido companyData explicitamente, tentar obter do localStorage
  const company = companyData || getCompanyData();
  const logo = logoUrl || company.logo;
  
  console.log('generateHeader: Dados finais da empresa:', company);
  console.log('generateHeader: Logo URL final:', logo);
  
  const headerHtml = `
    <div class="print-header">
      <div class="company-header">
        ${logo ? `<div class="logo-container"><img src="${logo}" alt="Logo da empresa" class="logo"></div>` : '<div class="logo-container">Sem logo</div>'}
        <div class="company-info">
          <h2 class="company-name">${company.nome || 'JN MADEIRAS'}</h2>
          ${company.cnpj ? `<p class="company-cnpj">CNPJ: ${company.cnpj}</p>` : ''}
          ${company.endereco ? `<p class="company-address">Endereço: ${company.endereco}</p>` : ''}
          ${company.cidade && company.estado ? `<p class="company-city">Cidade: ${company.cidade} - Estado: ${company.estado}</p>` : ''}
          ${company.telefone ? `<p class="company-phone">Telefone: ${company.telefone}</p>` : ''}
        </div>
      </div>
      ${title ? `<h1 class="document-title">${title}</h1>` : ''}
      <hr class="divider">
    </div>
    <style>
      .print-header {
        margin-bottom: 20px;
        width: 100%;
      }
      .company-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;
        padding-bottom: 10px;
        width: 100%;
      }
      .divider {
        border: none;
        border-top: 1px solid #333;
        margin: 10px 0 20px 0;
        width: 100%;
      }
      .logo-container {
        width: 180px;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 20px;
      }
      .logo {
        max-width: 180px;
        max-height: 120px;
        object-fit: contain;
      }
      .company-info {
        flex: 1;
        text-align: left;
        padding-top: 10px;
      }
      .company-name {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #333;
        font-weight: bold;
      }
      .company-cnpj, .company-address, .company-city, .company-phone {
        margin: 0 0 5px 0;
        font-size: 14px;
        color: #333;
      }
      .document-title {
        text-align: center;
        font-size: 16px;
        margin: 15px 0 5px 0;
        color: #333;
        font-weight: bold;
      }
    </style>
  `;
  
  console.log('generateHeader: HTML do cabeçalho gerado');
  return headerHtml;
}

/**
 * Gera seção com assinaturas para impressão
 * @param assinaturas Array com títulos das assinaturas
 */
export function generateSignatures(assinaturas: string[] = ['Cliente', 'Empresa']): string {
  return `
    <div class="signature">
      ${assinaturas.map(ass => `
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>${ass}</p>
        </div>
      `).join('')}
    </div>
  `;
} 