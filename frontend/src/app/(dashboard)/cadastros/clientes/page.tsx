"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { ClientesFiltros } from "@/components/clientes/clientes-filtros";
import { ClienteModal } from "@/components/clientes/cliente-modal";
import { ClienteDeleteDialog } from "@/components/clientes/cliente-delete-dialog";
import { useClientes } from "@/hooks/use-clientes";
import type { Cliente, ClienteFiltros } from "@/types/cliente";

const PAGE_SIZE = 15;

export default function ClientesPage() {
  const [filtros, setFiltros] = useState<ClienteFiltros>({
    search: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);

  const { data, isLoading, isError } = useClientes(filtros);

  function handleFiltroChange(parcial: Partial<ClienteFiltros> & { page: 1 }) {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }

  function abrirCriacao() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
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
          <Users className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">Gerencie o cadastro de clientes</p>
          </div>
        </div>
        <Button onClick={abrirCriacao} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <ClientesFiltros filtros={filtros} onChange={handleFiltroChange} />

      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          Erro ao carregar clientes. Verifique sua conexão e tente novamente.
        </div>
      )}

      <ClientesTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onEdit={abrirEdicao}
        onDelete={setExcluindo}
      />

      <ClienteModal open={modalOpen} cliente={editando} onClose={fecharModal} />
      <ClienteDeleteDialog cliente={excluindo} onClose={() => setExcluindo(null)} />
    </div>
  );
}
