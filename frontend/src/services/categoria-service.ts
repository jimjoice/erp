import api from "@/lib/axios";
import type { Categoria } from "@/types/produto";

export const categoriaService = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await api.get<Categoria[]>("/categorias");
    return data;
  },
};
