export type StatusVenda = "Orcamento" | "Finalizada" | "Cancelada";

export interface VendaLista {
  id: string;
  numero: number;
  status: StatusVenda;
  clienteId?: string;
  clienteNome?: string;
  funcionarioId: string;
  funcionarioNome: string;
  subtotal: number;
  desconto: number;
  total: number;
  createdAt: string;
}

export interface ItemVenda {
  id: string;
  produtoId: string;
  produtoNome: string;
  sku: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
}

export interface PagamentoVenda {
  id: string;
  forma: string;
  valor: number;
  parcelas: number;
}

export interface VendaDetalhe extends VendaLista {
  itens: ItemVenda[];
  pagamentos: PagamentoVenda[];
}

export interface ResumoDia {
  totalVendido: number;
  ticketMedio: number;
  quantidadeVendas: number;
}

export interface VendaFiltros {
  status: string;
  clienteId: string;
  funcionarioId: string;
  dataInicio: string;
  dataFim: string;
  page: number;
  pageSize: number;
}

export interface CancelarVendaDto {
  motivo: string;
}
