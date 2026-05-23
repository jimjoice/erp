import api from "@/lib/axios";
import type { Cliente, ClienteFiltros, CreateClienteDto, UpdateClienteDto } from "@/types/cliente";
import type { PaginatedResponse } from "@/types/api";

export const clienteService = {
  listar: async (filtros: ClienteFiltros): Promise<PaginatedResponse<Cliente>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.search) params.set("search", filtros.search);
    const { data } = await api.get<PaginatedResponse<Cliente>>(`/clientes?${params}`);
    return data;
  },

  obterPorId: async (id: string): Promise<Cliente> => {
    const { data } = await api.get<Cliente>(`/clientes/${id}`);
    return data;
  },

  criar: async (dto: CreateClienteDto): Promise<Cliente> => {
    const { data } = await api.post<Cliente>("/clientes", dto);
    return data;
  },

  atualizar: async (id: string, dto: UpdateClienteDto): Promise<Cliente> => {
    const { data } = await api.put<Cliente>(`/clientes/${id}`, dto);
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
