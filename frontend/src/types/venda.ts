export type FormaPagamento =
  | "Dinheiro"
  | "Debito"
  | "Credito"
  | "Pix"
  | "Crediario";

export const FORMA_PAGAMENTO_INT: Record<FormaPagamento, number> = {
  Dinheiro: 1,
  Debito: 2,
  Credito: 3,
  Pix: 4,
  Crediario: 5,
};

export const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Debito", label: "Cartão Débito" },
  { value: "Credito", label: "Cartão Crédito" },
  { value: "Pix", label: "PIX" },
  { value: "Crediario", label: "Crediário" },
];

export interface ItemCarrinho {
  localId: string;
  produtoId: string;
  nome: string;
  sku: string;
  codigoBarras?: string;
  precoUnitario: number;
  quantidade: number;
  estoqueAtual: number;
  unidadeMedida: string;
}

export interface PagamentoRascunho {
  localId: string;
  forma: FormaPagamento;
  valor: number;
  parcelas: number;
}

export interface VendaConfirmada {
  id: string;
  numero: number;
  total: number;
  troco: number;
}
