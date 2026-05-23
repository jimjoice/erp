import api from "@/lib/axios";
import type {
  ResumoFinanceiro,
  FluxoCaixaDia,
  ContaReceber,
  ContaPagar,
  ContaReceberFiltros,
  ContaPagarFiltros,
  BaixarContaDto,
} from "@/types/financeiro";
import type { PaginatedResponse } from "@/types/api";

export const financeiroService = {
  obterResumo: async (): Promise<ResumoFinanceiro> => {
    const { data } = await api.get<ResumoFinanceiro>("/financeiro/resumo");
    return data;
  },

  obterFluxoCaixa: async (inicio: string, fim: string): Promise<FluxoCaixaDia[]> => {
    const params = new URLSearchParams({ inicio, fim });
    const { data } = await api.get<FluxoCaixaDia[]>(`/financeiro/fluxo-caixa?${params}`);
    return data;
  },

  listarContasReceber: async (
    filtros: ContaReceberFiltros
  ): Promise<PaginatedResponse<ContaReceber>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.status) params.set("status", filtros.status);
    if (filtros.clienteId) params.set("clienteId", filtros.clienteId);
    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    const { data } = await api.get<PaginatedResponse<ContaReceber>>(`/contas-receber?${params}`);
    return data;
  },

  baixarContaReceber: async (id: string, dto: BaixarContaDto): Promise<void> => {
    await api.post(`/contas-receber/${id}/baixar`, dto);
  },

  listarContasPagar: async (
    filtros: ContaPagarFiltros
  ): Promise<PaginatedResponse<ContaPagar>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.status) params.set("status", filtros.status);
    if (filtros.fornecedorId) params.set("fornecedorId", filtros.fornecedorId);
    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    const { data } = await api.get<PaginatedResponse<ContaPagar>>(`/contas-pagar?${params}`);
    return data;
  },

  baixarContaPagar: async (id: string, dto: BaixarContaDto): Promise<void> => {
    await api.post(`/contas-pagar/${id}/baixar`, dto);
  },
};
