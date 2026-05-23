export type TipoPessoa = "PF" | "PJ";

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  endereco?: Endereco;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteFiltros {
  search: string;
  page: number;
  pageSize: number;
}

export interface CreateClienteDto {
  nome: string;
  tipoPessoa: TipoPessoa;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export type UpdateClienteDto = CreateClienteDto;
