import api from "@/lib/axios";
import type {
  DashboardResumo,
  FaturamentoDia,
  PagamentoPie,
  UltimaVenda,
  AlertaEstoque,
} from "@/types/dashboard";

interface ResumoDiaResponse {
  quantidadeVendas: number;
  totalVendido: number;
  ticketMedio: number;
}

interface ResumoFinanceiroResponse {
  quantidadeReceberProximos7Dias: number;
  quantidadePagarProximos7Dias: number;
}

interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const dashboardService = {
  obterResumo: async (): Promise<DashboardResumo> => {
    const [{ data: resumoDia }, { data: resumoFinanceiro }] = await Promise.all([
      api.get<ResumoDiaResponse>("/vendas/resumo-dia"),
      api.get<ResumoFinanceiroResponse>("/financeiro/resumo"),
    ]);

    return {
      faturamentoHoje: resumoDia.totalVendido,
      vendasHoje: resumoDia.quantidadeVendas,
      ticketMedioHoje: resumoDia.ticketMedio,
      contasVencendo:
        resumoFinanceiro.quantidadeReceberProximos7Dias +
        resumoFinanceiro.quantidadePagarProximos7Dias,
    };
  },

  obterFaturamento7Dias: async (): Promise<FaturamentoDia[]> => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 6);

    const { data } = await api.get<PagedResponse<UltimaVenda>>("/vendas", {
      params: {
        pageSize: 100,
        dataInicio: toISODate(inicio),
        dataFim: toISODate(hoje),
      },
    });

    const totaisPorDia = new Map<string, number>();
    for (const venda of data.items) {
      const dia = venda.dataVenda.split("T")[0];
      totaisPorDia.set(dia, (totaisPorDia.get(dia) ?? 0) + venda.total);
    }

    return Array.from(totaisPorDia.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dataStr, total]) => ({ data: dataStr, total }));
  },

  obterPagamentosHoje: async (): Promise<PagamentoPie[]> => {
    const hoje = toISODate(new Date());

    const { data } = await api.get<PagedResponse<UltimaVenda>>("/vendas", {
      params: {
        pageSize: 100,
        dataInicio: hoje,
        dataFim: hoje,
      },
    });

    const totaisPorForma = new Map<string, number>();
    for (const venda of data.items) {
      for (const pagamento of venda.pagamentos) {
        totaisPorForma.set(
          pagamento.forma,
          (totaisPorForma.get(pagamento.forma) ?? 0) + pagamento.valor
        );
      }
    }

    return Array.from(totaisPorForma.entries()).map(([forma, total]) => ({
      forma,
      total,
    }));
  },

  obterUltimasVendas: async (): Promise<UltimaVenda[]> => {
    const { data } = await api.get<PagedResponse<UltimaVenda>>("/vendas", {
      params: { pageSize: 5, page: 1 },
    });
    return data.items;
  },

  obterAlertas: async (): Promise<AlertaEstoque[]> => {
    const { data } = await api.get<AlertaEstoque[]>("/estoque/alertas");
    return data;
  },
};
