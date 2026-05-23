import { useQuery } from "@tanstack/react-query";
import { produtoService } from "@/services/produto-service";

export function useBuscaProdutoPdv(busca: string) {
  return useQuery({
    queryKey: ["pdv-busca", busca],
    queryFn: () =>
      produtoService.listar({
        busca,
        categoriaId: "",
        situacaoEstoque: "",
        page: 1,
        pageSize: 8,
      }),
    enabled: busca.trim().length >= 2,
    staleTime: 30_000,
  });
}
