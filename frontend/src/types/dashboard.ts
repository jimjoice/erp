export interface DashboardResumo {
  faturamentoHoje: number;
  vendasHoje: number;
  ticketMedioHoje: number;
  contasVencendo: number;
}

export interface FaturamentoDia {
  data: string;
  label: string;
  faturamento: number;
}

export interface PagamentoPie {
  forma: string;
  label: string;
  valor: number;
  percentual: number;
}

export interface UltimaVenda {
  id: string;
  numero: number;
  cliente: string | null;
  total: number;
  formaPrincipal: string;
  horario: string;
  status: string;
}

export interface AlertaEstoque {
  produtoId: string;
  nome: string;
  sku: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface ContaVencidaAlerta {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  tipo: "Pagar" | "Receber";
  diasAtraso: number;
}

export interface DashboardAlertas {
  estoqueBaixo: AlertaEstoque[];
  contasVencidas: ContaVencidaAlerta[];
}
