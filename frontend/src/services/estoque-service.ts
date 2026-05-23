import api from "@/lib/axios";
import type {
  PosicaoEstoque,
  AlertaEstoqueItem,
  MovimentacaoEstoque,
  EstoqueFiltros,
  MovimentacaoFiltros,
  EntradaMercadoriaDto,
  SaidaManualDto,
  AjusteInventarioDto,
} from "@/types/estoque";
import type { PaginatedResponse } from "@/types/api";

export const estoqueService = {
  listarPosicao: async (filtros: EstoqueFiltros): Promise<PaginatedResponse<PosicaoEstoque>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.search) params.set("search", filtros.search);
    const { data } = await api.get<PaginatedResponse<PosicaoEstoque>>(`/estoque?${params}`);
    return data;
  },

  obterAlertas: async (): Promise<AlertaEstoqueItem[]> => {
    const { data } = await api.get<AlertaEstoqueItem[]>("/estoque/alertas");
    return data;
  },

  listarMovimentacoes: async (
    filtros: MovimentacaoFiltros
  ): Promise<PaginatedResponse<MovimentacaoEstoque>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.produtoId) params.set("produtoId", filtros.produtoId);
    if (filtros.tipo) params.set("tipo", filtros.tipo);
    if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
    if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
    const { data } = await api.get<PaginatedResponse<MovimentacaoEstoque>>(
      `/estoque/movimentacoes?${params}`
    );
    return data;
  },

  entrada: async (dto: EntradaMercadoriaDto): Promise<void> => {
    await api.post("/estoque/entrada", dto);
  },

  saida: async (dto: SaidaManualDto): Promise<void> => {
    await api.post("/estoque/saida", dto);
  },

  inventario: async (dto: AjusteInventarioDto): Promise<void> => {
    await api.post("/estoque/inventario", dto);
  },
};
