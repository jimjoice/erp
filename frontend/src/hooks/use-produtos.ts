import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtoService } from "@/services/produto-service";
import type { ProdutoFiltros, CreateProdutoDto, UpdateProdutoDto } from "@/types/produto";

export function useProdutos(filtros: ProdutoFiltros) {
  return useQuery({
    queryKey: ["produtos", filtros],
    queryFn: () => produtoService.listar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProdutoDto) => produtoService.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useAtualizarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProdutoDto }) =>
      produtoService.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useExcluirProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => produtoService.excluir(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}
