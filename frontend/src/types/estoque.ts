export type TipoMovimentacao =
  | "Entrada"
  | "SaidaVenda"
  | "SaidaManual"
  | "Inventario";

export type SituacaoEstoque = "normal" | "baixo" | "zerado";

export interface PosicaoEstoque {
  produtoId: string;
  produtoNome: string;
  sku: string;
  unidadeMedida: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  situacao: SituacaoEstoque;
}

export interface AlertaEstoqueItem {
  produtoId: string;
  produtoNome: string;
  sku: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  situacao: "baixo" | "zerado";
}

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produtoNome: string;
  sku: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  motivo?: string;
  createdAt: string;
}

export interface EstoqueFiltros {
  search: string;
  page: number;
  pageSize: number;
}

export interface MovimentacaoFiltros {
  produtoId: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
}

export interface EntradaMercadoriaDto {
  produtoId: string;
  quantidade: number;
  motivo: string;
  custo?: number;
}

export interface SaidaManualDto {
  produtoId: string;
  quantidade: number;
  motivo: string;
}

export interface AjusteInventarioDto {
  produtoId: string;
  quantidadeContada: number;
  motivo: string;
}
