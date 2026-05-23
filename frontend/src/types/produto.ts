export type UnidadeMedida =
  | "UN" | "KG" | "G" | "L" | "ML"
  | "M" | "M2" | "M3" | "CX" | "PCT" | "PR" | "DZ";

export type SituacaoEstoque = "normal" | "baixo" | "zerado";

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  codigoBarras?: string;
  ncm?: string;
  descricao?: string;
  precoCusto: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidadeMedida: UnidadeMedida;
  categoriaId: string;
  categoriaNome: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProdutoFiltros {
  busca: string;
  categoriaId: string;
  situacaoEstoque: string;
  page: number;
  pageSize: number;
}

export interface CreateProdutoDto {
  nome: string;
  sku: string;
  codigoBarras?: string;
  ncm?: string;
  descricao?: string;
  precoCusto: number;
  precoVenda: number;
  estoqueMinimo: number;
  unidadeMedida: UnidadeMedida;
  categoriaId: string;
}

export type UpdateProdutoDto = Omit<CreateProdutoDto, "sku">;
