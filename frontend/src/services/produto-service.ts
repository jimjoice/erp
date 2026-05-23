import api from "@/lib/axios";
import type { Produto, CreateProdutoDto, UpdateProdutoDto, ProdutoFiltros } from "@/types/produto";
import type { PaginatedResponse } from "@/types/api";

export const produtoService = {
  listar: async (filtros: ProdutoFiltros): Promise<PaginatedResponse<Produto>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.busca) params.set("busca", filtros.busca);
    if (filtros.categoriaId) params.set("categoriaId", filtros.categoriaId);
    if (filtros.situacaoEstoque) params.set("situacaoEstoque", filtros.situacaoEstoque);

    const { data } = await api.get<PaginatedResponse<Produto>>(`/produtos?${params}`);
    return data;
  },

  criar: async (dto: CreateProdutoDto): Promise<Produto> => {
    const { data } = await api.post<Produto>("/produtos", dto);
    return data;
  },

  atualizar: async (id: string, dto: UpdateProdutoDto): Promise<Produto> => {
    const { data } = await api.put<Produto>(`/produtos/${id}`, dto);
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};
