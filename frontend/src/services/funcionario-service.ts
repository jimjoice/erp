import api from "@/lib/axios";
import type { Funcionario, FuncionarioFiltros, CreateFuncionarioDto, UpdateFuncionarioDto } from "@/types/funcionario";
import type { PaginatedResponse } from "@/types/api";

export const funcionarioService = {
  listar: async (filtros: FuncionarioFiltros): Promise<PaginatedResponse<Funcionario>> => {
    const params = new URLSearchParams({
      page: String(filtros.page),
      pageSize: String(filtros.pageSize),
    });
    if (filtros.search) params.set("search", filtros.search);
    const { data } = await api.get<PaginatedResponse<Funcionario>>(`/funcionarios?${params}`);
    return data;
  },

  obterPorId: async (id: string): Promise<Funcionario> => {
    const { data } = await api.get<Funcionario>(`/funcionarios/${id}`);
    return data;
  },

  criar: async (dto: CreateFuncionarioDto): Promise<Funcionario> => {
    const { data } = await api.post<Funcionario>("/funcionarios", dto);
    return data;
  },

  atualizar: async (id: string, dto: UpdateFuncionarioDto): Promise<Funcionario> => {
    const { data } = await api.put<Funcionario>(`/funcionarios/${id}`, dto);
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/funcionarios/${id}`);
  },
};
