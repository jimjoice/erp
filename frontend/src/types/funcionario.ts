export type CargoFuncionario = "Admin" | "Gerente" | "Vendedor" | "Financeiro";

export interface Funcionario {
  id: string;
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  telefone?: string;
  cpf?: string;
  salario?: number;
  dataAdmissao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuncionarioFiltros {
  search: string;
  page: number;
  pageSize: number;
}

export interface CreateFuncionarioDto {
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
  salario?: number;
  dataAdmissao?: string;
}

export interface UpdateFuncionarioDto {
  nome: string;
  cargo: CargoFuncionario;
  email: string;
  telefone?: string;
  cpf?: string;
  salario?: number;
  dataAdmissao?: string;
}
