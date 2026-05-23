import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

const STALE = 60_000;

export function useDashboardResumo() {
  return useQuery({
    queryKey: ["dashboard", "resumo"],
    queryFn: dashboardService.obterResumo,
    staleTime: STALE,
  });
}

export function useFaturamento7Dias() {
  return useQuery({
    queryKey: ["dashboard", "faturamento-7-dias"],
    queryFn: dashboardService.obterFaturamento7Dias,
    staleTime: STALE,
  });
}

export function usePagamentosHoje() {
  return useQuery({
    queryKey: ["dashboard", "pagamentos-hoje"],
    queryFn: dashboardService.obterPagamentosHoje,
    staleTime: STALE,
  });
}

export function useUltimasVendas() {
  return useQuery({
    queryKey: ["dashboard", "ultimas-vendas"],
    queryFn: dashboardService.obterUltimasVendas,
    staleTime: STALE,
  });
}

export function useDashboardAlertas() {
  return useQuery({
    queryKey: ["dashboard", "alertas"],
    queryFn: dashboardService.obterAlertas,
    staleTime: STALE,
  });
}
