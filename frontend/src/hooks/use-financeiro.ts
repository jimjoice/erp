import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeiroService } from "@/services/financeiro-service";
import type {
  ContaReceberFiltros,
  ContaPagarFiltros,
  BaixarContaDto,
} from "@/types/financeiro";

export function useResumoFinanceiro() {
  return useQuery({
    queryKey: ["financeiro", "resumo"],
    queryFn: () => financeiroService.obterResumo(),
    refetchInterval: 60_000,
  });
}

export function useFluxoCaixa(inicio: string, fim: string) {
  return useQuery({
    queryKey: ["financeiro", "fluxo-caixa", inicio, fim],
    queryFn: () => financeiroService.obterFluxoCaixa(inicio, fim),
    enabled: !!inicio && !!fim,
  });
}

export function useContasReceber(filtros: ContaReceberFiltros) {
  return useQuery({
    queryKey: ["contas-receber", filtros],
    queryFn: () => financeiroService.listarContasReceber(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useBaixarContaReceber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: BaixarContaDto }) =>
      financeiroService.baixarContaReceber(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas-receber"] });
      qc.invalidateQueries({ queryKey: ["financeiro"] });
    },
  });
}

export function useContasPagar(filtros: ContaPagarFiltros) {
  return useQuery({
    queryKey: ["contas-pagar", filtros],
    queryFn: () => financeiroService.listarContasPagar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useBaixarContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: BaixarContaDto }) =>
      financeiroService.baixarContaPagar(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas-pagar"] });
      qc.invalidateQueries({ queryKey: ["financeiro"] });
    },
  });
}
