import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendasListaService } from "@/services/vendas-lista-service";
import type { VendaFiltros, CancelarVendaDto } from "@/types/venda-lista";

export function useVendasLista(filtros: VendaFiltros) {
  return useQuery({
    queryKey: ["vendas-lista", filtros],
    queryFn: () => vendasListaService.listar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useResumoDiaVendas() {
  return useQuery({
    queryKey: ["vendas-lista", "resumo-dia"],
    queryFn: () => vendasListaService.obterResumoDia(),
    refetchInterval: 60_000,
  });
}

export function useVendaDetalhe(id: string | null) {
  return useQuery({
    queryKey: ["vendas-lista", "detalhe", id],
    queryFn: () => vendasListaService.obterDetalhe(id!),
    enabled: !!id,
  });
}

export function useCancelarVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelarVendaDto }) =>
      vendasListaService.cancelar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendas-lista"] }),
  });
}
