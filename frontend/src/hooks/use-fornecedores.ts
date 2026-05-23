import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fornecedorService } from "@/services/fornecedor-service";
import type { FornecedorFiltros, CreateFornecedorDto, UpdateFornecedorDto } from "@/types/fornecedor";

export function useFornecedores(filtros: FornecedorFiltros) {
  return useQuery({
    queryKey: ["fornecedores", filtros],
    queryFn: () => fornecedorService.listar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useCriarFornecedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFornecedorDto) => fornecedorService.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });
}

export function useAtualizarFornecedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFornecedorDto }) =>
      fornecedorService.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });
}

export function useExcluirFornecedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fornecedorService.excluir(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fornecedores"] }),
  });
}
