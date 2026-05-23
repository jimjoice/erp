import api from "@/lib/axios";
import type {
  VendaLista,
  VendaDetalhe,
  VendaFiltros,
  ResumoDia,
  CancelarVendaDto,
} from "@/types/venda-lista";
import type { PaginatedResponse } from "@/types/api";

export const vendasListaService = {
  listar: async (filtros: VendaFiltros): Promise<PaginatedResponse<VendaLista>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.status) params.set("status", filtros.status);
    if (filtros.clienteId) params.set("clienteId", filtros.clienteId);
    if (filtros.funcionarioId) params.set("funcionarioId", filtros.funcionarioId);
    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    const { data } = await api.get<PaginatedResponse<VendaLista>>(`/vendas?${params}`);
    return data;
  },

  obterResumoDia: async (): Promise<ResumoDia> => {
    const { data } = await api.get<ResumoDia>("/vendas/resumo-dia");
    return data;
  },

  obterDetalhe: async (id: string): Promise<VendaDetalhe> => {
    const { data } = await api.get<VendaDetalhe>(`/vendas/${id}`);
    return data;
  },

  cancelar: async (id: string, dto: CancelarVendaDto): Promise<void> => {
    await api.post(`/vendas/${id}/cancelar`, dto);
  },
};
