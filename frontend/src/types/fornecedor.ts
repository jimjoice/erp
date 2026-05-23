export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
  condicoesPagamento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FornecedorFiltros {
  search: string;
  page: number;
  pageSize: number;
}

export interface CreateFornecedorDto {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  condicoesPagamento?: string;
}

export type UpdateFornecedorDto = CreateFornecedorDto;
