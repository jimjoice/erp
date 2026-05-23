import api from "@/lib/axios";
import type {
  DashboardResumo,
  FaturamentoDia,
  PagamentoPie,
  UltimaVenda,
  DashboardAlertas,
} from "@/types/dashboard";

export const dashboardService = {
  obterResumo: async (): Promise<DashboardResumo> => {
    const { data } = await api.get<DashboardResumo>("/dashboard/resumo");
    return data;
  },

  obterFaturamento7Dias: async (): Promise<FaturamentoDia[]> => {
    const { data } = await api.get<FaturamentoDia[]>("/dashboard/faturamento-7-dias");
    return data;
  },

  obterPagamentosHoje: async (): Promise<PagamentoPie[]> => {
    const { data } = await api.get<PagamentoPie[]>("/dashboard/pagamentos-hoje");
    return data;
  },

  obterUltimasVendas: async (): Promise<UltimaVenda[]> => {
    const { data } = await api.get<UltimaVenda[]>("/dashboard/ultimas-vendas");
    return data;
  },

  obterAlertas: async (): Promise<DashboardAlertas> => {
    const { data } = await api.get<DashboardAlertas>("/dashboard/alertas");
    return data;
  },
};
