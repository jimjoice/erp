export type StatusConta = "Pendente" | "Pago" | "Vencido" | "Cancelado";

export interface ResumoFinanceiro {
  saldoCaixa: number;
  totalReceberProximos7Dias: number;
  totalPagarProximos7Dias: number;
  totalVencidoReceber: number;
  totalVencidoPagar: number;
}

export interface FluxoCaixaDia {
  data: string;
  label: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface ContaReceber {
  id: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  valor: number;
  valorPago?: number;
  vencimento: string;
  status: StatusConta;
  dataPagamento?: string;
  formaPagamento?: string;
  vendaId?: string;
}

export interface ContaPagar {
  id: string;
  fornecedorId?: string;
  fornecedorNome?: string;
  descricao: string;
  valor: number;
  valorPago?: number;
  vencimento: string;
  status: StatusConta;
  dataPagamento?: string;
  formaPagamento?: string;
}

export interface ContaReceberFiltros {
  status: string;
  clienteId: string;
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
}

export interface ContaPagarFiltros {
  status: string;
  fornecedorId: string;
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
}

export interface BaixarContaDto {
  valor: number;
  formaPagamento: string;
  dataPagamento: string;
  observacao?: string;
}
