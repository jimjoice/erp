"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FornecedoresTable } from "@/components/fornecedores/fornecedores-table";
import { FornecedoresFiltros } from "@/components/fornecedores/fornecedores-filtros";
import { FornecedorModal } from "@/components/fornecedores/fornecedor-modal";
import { FornecedorDeleteDialog } from "@/components/fornecedores/fornecedor-delete-dialog";
import { useFornecedores } from "@/hooks/use-fornecedores";
import type { Fornecedor, FornecedorFiltros } from "@/types/fornecedor";

const PAGE_SIZE = 15;

export default function FornecedoresPage() {
  const [filtros, setFiltros] = useState<FornecedorFiltros>({
    search: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [excluindo, setExcluindo] = useState<Fornecedor | null>(null);

  const { data, isLoading, isError } = useFornecedores(filtros);

  function handleFiltroChange(parcial: Partial<FornecedorFiltros> & { page: 1 }) {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }

  function abrirCriacao() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEdicao(fornecedor: Fornecedor) {
    setEditando(fornecedor);
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
          <Building2 className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-sm text-muted-foreground">Gerencie o cadastro de fornecedores</p>
          </div>
        </div>
        <Button onClick={abrirCriacao} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo fornecedor
        </Button>
      </div>

      <FornecedoresFiltros filtros={filtros} onChange={handleFiltroChange} />

      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          Erro ao carregar fornecedores. Verifique sua conexão e tente novamente.
        </div>
      )}

      <FornecedoresTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onEdit={abrirEdicao}
        onDelete={setExcluindo}
      />

      <FornecedorModal open={modalOpen} fornecedor={editando} onClose={fecharModal} />
      <FornecedorDeleteDialog fornecedor={excluindo} onClose={() => setExcluindo(null)} />
    </div>
  );
}
