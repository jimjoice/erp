import { useQuery } from "@tanstack/react-query";
import { categoriaService } from "@/services/categoria-service";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriaService.listar(),
    staleTime: 5 * 60 * 1000,
  });
}
