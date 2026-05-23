import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteService } from "@/services/cliente-service";
import type { ClienteFiltros, CreateClienteDto, UpdateClienteDto } from "@/types/cliente";

export function useClientes(filtros: ClienteFiltros) {
  return useQuery({
    queryKey: ["clientes", filtros],
    queryFn: () => clienteService.listar(filtros),
    placeholderData: (prev) => prev,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClienteDto) => clienteService.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClienteDto }) =>
      clienteService.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useExcluirCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clienteService.excluir(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
