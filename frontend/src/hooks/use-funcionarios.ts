import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { funcionarioService } from "@/services/funcionario-service";
import type { FuncionarioFiltros, CreateFuncionarioDto, UpdateFuncionarioDto } from "@/types/funcionario";

export function useFuncionarios(filtros: FuncionarioFiltros) {
  return useQuery({
    queryKey: ["funcionarios", filtros],
    queryFn: () => funcionarioService.listar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useCriarFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFuncionarioDto) => funcionarioService.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funcionarios"] }),
  });
}

export function useAtualizarFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFuncionarioDto }) =>
      funcionarioService.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funcionarios"] }),
  });
}

export function useExcluirFuncionario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => funcionarioService.excluir(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["funcionarios"] }),
  });
}
