import React, { useState } from 'react';
import styled from 'styled-components';
import { pesParaMetrosCubicos, formatarVolume } from '../../utils/madeira';
import PageHeader from '../../components/PageHeader';

interface PesItem {
  largura: string;
  espessura: string;
  comprimento: string;
  quantidade: string;
  pesCubicos: string;
}

// Interface para os props dos styled-components com tema
interface ThemedProps {
  theme: any;
}

const RomaneioPES: React.FC = () => {
  const [romaneioData, setRomaneioData] = useState({
    cliente: '',
    data: '',
    motorista: '',
    placa: '',
    especie: '',
    observacoes: '',
    itens: [{ largura: '', espessura: '', comprimento: '', quantidade: '1', pesCubicos: '' }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRomaneioData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...romaneioData.itens];
    newItems[index] = {
      ...newItems[index],
      [name]: value
    };
    setRomaneioData(prev => ({
      ...prev,
      itens: newItems
    }));
  };

  const addItem = () => {
    setRomaneioData(prev => ({
      ...prev,
      itens: [...prev.itens, { largura: '', espessura: '', comprimento: '', quantidade: '1', pesCubicos: '' }]
    }));
  };

  const removeItem = (index: number) => {
    if (romaneioData.itens.length === 1) return;
    const newItems = romaneioData.itens.filter((_, i) => i !== index);
    setRomaneioData(prev => ({
      ...prev,
      itens: newItems
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica para salvar o romaneio
    console.log('Romaneio submetido:', romaneioData);
    alert('Romaneio Cubagem em Pés salvo com sucesso!');
  };

  return (
    <Container>
      <PageHeader
        title="Romaneio - Cubagem em Pés"
        description="Cadastro de romaneio com conversão de pés cúbicos para metros cúbicos."
      />

      <FormContainer onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Informações Gerais</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                type="text"
                id="cliente"
                name="cliente"
                value={romaneioData.cliente}
                onChange={handleInputChange}
                required
                placeholder="Nome do cliente"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="data">Data</Label>
              <Input
                type="date"
                id="data"
                name="data"
                value={romaneioData.data}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="motorista">Motorista</Label>
              <Input
                type="text"
                id="motorista"
                name="motorista"
                value={romaneioData.motorista}
                onChange={handleInputChange}
                placeholder="Nome do motorista"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="placa">Placa do Veículo</Label>
              <Input
                type="text"
                id="placa"
                name="placa"
                value={romaneioData.placa}
                onChange={handleInputChange}
                placeholder="AAA-0000"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="especie">Espécie</Label>
              <Select
                id="especie"
                name="especie"
                value={romaneioData.especie}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione uma espécie</option>
                <option value="eucalipto">Eucalipto</option>
                <option value="pinus">Pinus</option>
                <option value="cedro">Cedro</option>
                <option value="angico">Angico</option>
              </Select>
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>Itens do Romaneio</SectionTitle>
          <InfoText>
            Preencha as dimensões em polegadas e os pés cúbicos. O sistema calculará automaticamente o volume em metros cúbicos.
          </InfoText>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Largura (pol)</TableHeader>
                  <TableHeader>Espessura (pol)</TableHeader>
                  <TableHeader>Comprimento (pés)</TableHeader>
                  <TableHeader>Quantidade</TableHeader>
                  <TableHeader>Pés Cúbicos</TableHeader>
                  <TableHeader>Volume (m³)</TableHeader>
                  <TableHeader>Ações</TableHeader>
                </tr>
              </thead>
              <tbody>
                {romaneioData.itens.map((item, index) => {
                  // Leitura dos valores
                  const pesCubicos = parseFloat(item.pesCubicos) || 0;
                  
                  // Conversão para metros cúbicos
                  const metrosCubicos = pesParaMetrosCubicos(pesCubicos);
                  const metrosCubicosFormatados = formatarVolume(metrosCubicos);

                  return (
                    <tr key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          name="largura"
                          value={item.largura}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e)}
                          min="0.1"
                          step="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          name="espessura"
                          value={item.espessura}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e)}
                          min="0.1"
                          step="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          name="comprimento"
                          value={item.comprimento}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e)}
                          min="0.1"
                          step="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          name="quantidade"
                          value={item.quantidade}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e)}
                          min="1"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          name="pesCubicos"
                          value={item.pesCubicos}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e)}
                          min="0.001"
                          step="0.001"
                          required
                        />
                      </TableCell>
                      <TableCell>{metrosCubicosFormatados} m³</TableCell>
                      <TableCell>
                        <ActionButton
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={romaneioData.itens.length === 1}
                        >
                          <i className="fas fa-trash"></i>
                        </ActionButton>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <TableFooter colSpan={4} align="right">
                    Volume Total:
                  </TableFooter>
                  <TableFooter>
                    {romaneioData.itens
                      .reduce((total, item) => {
                        const pesCubicos = parseFloat(item.pesCubicos) || 0;
                        return total + pesCubicos;
                      }, 0)
                      .toFixed(3)}{' '}
                    pés³
                  </TableFooter>
                  <TableFooter>
                    {formatarVolume(
                      romaneioData.itens.reduce((total, item) => {
                        const pesCubicos = parseFloat(item.pesCubicos) || 0;
                        return total + pesParaMetrosCubicos(pesCubicos);
                      }, 0)
                    )}{' '}
                    m³
                  </TableFooter>
                  <TableFooter></TableFooter>
                </tr>
              </tfoot>
            </Table>
          </TableContainer>
          <AddButton type="button" onClick={addItem}>
            <i className="fas fa-plus"></i> Adicionar Item
          </AddButton>
        </FormSection>

        <FormSection>
          <SectionTitle>Observações</SectionTitle>
          <TextArea
            name="observacoes"
            value={romaneioData.observacoes}
            onChange={handleInputChange}
            placeholder="Observações adicionais sobre este romaneio..."
            rows={4}
          />
        </FormSection>

        <ButtonsContainer>
          <CancelButton type="button">Cancelar</CancelButton>
          <SubmitButton type="submit">Salvar Romaneio</SubmitButton>
        </ButtonsContainer>
      </FormContainer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const InfoText = styled.p<{ theme: any }>`
  color: ${(props: ThemedProps) => props.theme.colors.secondary};
  font-style: italic;
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.medium};
`;

const FormContainer = styled.form<{ theme: any }>`
  background-color: ${(props: ThemedProps) => props.theme.colors.cardBackground};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.medium};
  box-shadow: ${(props: ThemedProps) => props.theme.shadows.small};
  padding: ${(props: ThemedProps) => props.theme.spacing.medium};
`;

const FormSection = styled.section<{ theme: any }>`
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.large};
`;

const SectionTitle = styled.h2<{ theme: any }>`
  font-size: ${(props: ThemedProps) => props.theme.fontSizes.medium};
  color: ${(props: ThemedProps) => props.theme.colors.dark};
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.medium};
  padding-bottom: ${(props: ThemedProps) => props.theme.spacing.small};
  border-bottom: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
`;

const FormRow = styled.div<{ theme: any }>`
  display: flex;
  flex-wrap: wrap;
  margin: 0 -${(props: ThemedProps) => props.theme.spacing.small};
`;

const FormGroup = styled.div<{ theme: any }>`
  flex: 1;
  min-width: 250px;
  padding: 0 ${(props: ThemedProps) => props.theme.spacing.small};
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.medium};
`;

const Label = styled.label<{ theme: any }>`
  display: block;
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.small};
  color: ${(props: ThemedProps) => props.theme.colors.dark};
  font-weight: 500;
`;

const Input = styled.input<{ theme: any }>`
  width: 100%;
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  font-size: ${(props: ThemedProps) => props.theme.fontSizes.small};
  
  &:focus {
    outline: none;
    border-color: ${(props: ThemedProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const TextArea = styled.textarea<{ theme: any }>`
  width: 100%;
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  font-size: ${(props: ThemedProps) => props.theme.fontSizes.small};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${(props: ThemedProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const Select = styled.select<{ theme: any }>`
  width: 100%;
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  font-size: ${(props: ThemedProps) => props.theme.fontSizes.small};
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${(props: ThemedProps) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

const TableContainer = styled.div<{ theme: any }>`
  overflow-x: auto;
  margin-bottom: ${(props: ThemedProps) => props.theme.spacing.medium};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th<{ theme: any }>`
  text-align: left;
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border-bottom: 2px solid ${(props: ThemedProps) => props.theme.colors.border};
  color: ${(props: ThemedProps) => props.theme.colors.dark};
  font-weight: 600;
`;

const TableCell = styled.td<{ theme: any }>`
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border-bottom: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
`;

const TableFooter = styled.td<{ align?: string; theme: any }>`
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  border-top: 2px solid ${(props: ThemedProps) => props.theme.colors.border};
  font-weight: 600;
  text-align: ${(props: { align?: string }) => props.align || 'left'};
`;

const ActionButton = styled.button<{ theme: any }>`
  background: none;
  border: none;
  color: ${(props: ThemedProps) => props.theme.colors.danger};
  cursor: pointer;
  padding: ${(props: ThemedProps) => props.theme.spacing.small};
  
  &:disabled {
    color: ${(props: ThemedProps) => props.theme.colors.border};
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    color: ${(props: ThemedProps) => props.theme.colors.danger};
  }
`;

const AddButton = styled.button<{ theme: any }>`
  background: none;
  border: 1px dashed ${(props: ThemedProps) => props.theme.colors.border};
  color: ${(props: ThemedProps) => props.theme.colors.primary};
  padding: ${(props: ThemedProps) => props.theme.spacing.small} ${(props: ThemedProps) => props.theme.spacing.medium};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all ${(props: ThemedProps) => props.theme.transitions.default};
  
  i {
    margin-right: ${(props: ThemedProps) => props.theme.spacing.small};
  }
  
  &:hover {
    background-color: rgba(13, 110, 253, 0.05);
    border-color: ${(props: ThemedProps) => props.theme.colors.primary};
  }
`;

const ButtonsContainer = styled.div<{ theme: any }>`
  display: flex;
  justify-content: flex-end;
  gap: ${(props: ThemedProps) => props.theme.spacing.medium};
`;

const SubmitButton = styled.button<{ theme: any }>`
  background-color: ${(props: ThemedProps) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${(props: ThemedProps) => props.theme.spacing.small} ${(props: ThemedProps) => props.theme.spacing.large};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  cursor: pointer;
  transition: background-color ${(props: ThemedProps) => props.theme.transitions.default};
  
  &:hover {
    background-color: #0b5ed7; // Slightly darker blue
  }
`;

const CancelButton = styled.button<{ theme: any }>`
  background-color: ${(props: ThemedProps) => props.theme.colors.light};
  color: ${(props: ThemedProps) => props.theme.colors.dark};
  border: 1px solid ${(props: ThemedProps) => props.theme.colors.border};
  padding: ${(props: ThemedProps) => props.theme.spacing.small} ${(props: ThemedProps) => props.theme.spacing.large};
  border-radius: ${(props: ThemedProps) => props.theme.borderRadius.small};
  cursor: pointer;
  transition: all ${(props: ThemedProps) => props.theme.transitions.default};
  
  &:hover {
    background-color: ${(props: ThemedProps) => props.theme.colors.border};
  }
`;

export default RomaneioPES; 