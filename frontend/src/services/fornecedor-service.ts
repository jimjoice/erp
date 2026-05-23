import api from "@/lib/axios";
import type { Fornecedor, FornecedorFiltros, CreateFornecedorDto, UpdateFornecedorDto } from "@/types/fornecedor";
import type { PaginatedResponse } from "@/types/api";

export const fornecedorService = {
  listar: async (filtros: FornecedorFiltros): Promise<PaginatedResponse<Fornecedor>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.search) params.set("search", filtros.search);
    const { data } = await api.get<PaginatedResponse<Fornecedor>>(`/fornecedores?${params}`);
    return data;
  },

  obterPorId: async (id: string): Promise<Fornecedor> => {
    const { data } = await api.get<Fornecedor>(`/fornecedores/${id}`);
    return data;
  },

  criar: async (dto: CreateFornecedorDto): Promise<Fornecedor> => {
    const { data } = await api.post<Fornecedor>("/fornecedores", dto);
    return data;
  },

  atualizar: async (id: string, dto: UpdateFornecedorDto): Promise<Fornecedor> => {
    const { data } = await api.put<Fornecedor>(`/fornecedores/${id}`, dto);
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/fornecedores/${id}`);
  },
};
