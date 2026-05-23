export interface DashboardResumo {
  faturamentoHoje: number;
  vendasHoje: number;
  ticketMedioHoje: number;
  contasVencendo: number;
}

export interface FaturamentoDia {
  data: string;
  total: number;
}

export interface PagamentoPie {
  forma: string;
  total: number;
}

export interface UltimaVenda {
  id: string;
  numero: number;
  clienteNome: string | null;
  funcionarioNome: string | null;
  status: string;
  dataVenda: string;
  subtotal: number;
  desconto: number;
  total: number;
  pagamentos: { id: string; forma: string; valor: number; parcelas: number }[];
}

export interface AlertaEstoque {
  produtoId: string;
  nome: string;
  sku: string;
  codigoBarras: string | null;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidadeMedida: string;
  situacao: string;
}
