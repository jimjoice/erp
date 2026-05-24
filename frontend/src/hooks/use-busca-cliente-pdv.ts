import { useQuery } from "@tanstack/react-query";
import { clienteService } from "@/services/cliente-service";

export function useBuscaClientePdv(busca: string) {
  return useQuery({
    queryKey: ["pdv-busca-cliente", busca],
    queryFn: () =>
      clienteService.listar({ search: busca, page: 1, pageSize: 6 }),
    enabled: busca.trim().length >= 2,
    staleTime: 60_000,
  });
}
