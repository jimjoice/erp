import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { estoqueService } from "@/services/estoque-service";
import type {
  EstoqueFiltros,
  MovimentacaoFiltros,
  EntradaMercadoriaDto,
  SaidaManualDto,
  AjusteInventarioDto,
} from "@/types/estoque";

export function usePosicaoEstoque(filtros: EstoqueFiltros) {
  return useQuery({
    queryKey: ["estoque", "posicao", filtros],
    queryFn: () => estoqueService.listarPosicao(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useAlertasEstoque() {
  return useQuery({
    queryKey: ["estoque", "alertas"],
    queryFn: () => estoqueService.obterAlertas(),
  });
}

export function useMovimentacoesEstoque(filtros: MovimentacaoFiltros) {
  return useQuery({
    queryKey: ["estoque", "movimentacoes", filtros],
    queryFn: () => estoqueService.listarMovimentacoes(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useEntradaEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: EntradaMercadoriaDto) => estoqueService.entrada(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useSaidaEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaidaManualDto) => estoqueService.saida(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useInventarioEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AjusteInventarioDto) => estoqueService.inventario(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}
