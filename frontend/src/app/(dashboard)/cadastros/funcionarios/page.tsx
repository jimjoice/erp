"use client";

import { useState } from "react";
import { Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";
import { FuncionariosFiltros } from "@/components/funcionarios/funcionarios-filtros";
import { FuncionarioModal } from "@/components/funcionarios/funcionario-modal";
import { FuncionarioDeleteDialog } from "@/components/funcionarios/funcionario-delete-dialog";
import { useFuncionarios } from "@/hooks/use-funcionarios";
import type { Funcionario, FuncionarioFiltros } from "@/types/funcionario";

const PAGE_SIZE = 15;

export default function FuncionariosPage() {
  const [filtros, setFiltros] = useState<FuncionarioFiltros>({
    search: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [excluindo, setExcluindo] = useState<Funcionario | null>(null);

  const { data, isLoading, isError } = useFuncionarios(filtros);

  function handleFiltroChange(parcial: Partial<FuncionarioFiltros> & { page: 1 }) {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }

  function abrirCriacao() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEdicao(funcionario: Funcionario) {
    setEditando(funcionario);
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setEditando(null);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-sm text-muted-foreground">Gerencie o cadastro de funcionários</p>
          </div>
        </div>
        <Button onClick={abrirCriacao} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo funcionário
        </Button>
      </div>

      <FuncionariosFiltros filtros={filtros} onChange={handleFiltroChange} />

      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          Erro ao carregar funcionários. Verifique sua conexão e tente novamente.
        </div>
      )}

      <FuncionariosTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onEdit={abrirEdicao}
        onDelete={setExcluindo}
      />

      <FuncionarioModal open={modalOpen} funcionario={editando} onClose={fecharModal} />
      <FuncionarioDeleteDialog funcionario={excluindo} onClose={() => setExcluindo(null)} />
    </div>
  );
}
