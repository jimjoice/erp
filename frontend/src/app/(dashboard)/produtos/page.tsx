"use client";

import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProdutosTable } from "@/components/produtos/produtos-table";
import { ProdutosFiltros } from "@/components/produtos/produtos-filtros";
import { ProdutoModal } from "@/components/produtos/produto-modal";
import { ProdutoDeleteDialog } from "@/components/produtos/produto-delete-dialog";
import { useProdutos } from "@/hooks/use-produtos";
import type { Produto, ProdutoFiltros } from "@/types/produto";

const PAGE_SIZE = 15;

export default function ProdutosPage() {
  const [filtros, setFiltros] = useState<ProdutoFiltros>({
    busca: "",
    categoriaId: "",
    situacaoEstoque: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState<Produto | null>(null);

  const { data, isLoading, isError } = useProdutos(filtros);

  function handleFiltroChange(
    parcial: Partial<ProdutoFiltros> & { page: 1 }
  ) {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }

  function abrirCriacao() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEdicao(produto: Produto) {
    setEditando(produto);
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setEditando(null);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o catálogo de produtos
            </p>
          </div>
        </div>
        <Button onClick={abrirCriacao} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {/* Filtros */}
      <ProdutosFiltros filtros={filtros} onChange={handleFiltroChange} />

      {/* Erro */}
      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          Erro ao carregar produtos. Verifique sua conexão e tente novamente.
        </div>
      )}

      {/* Tabela */}
      <ProdutosTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onEdit={abrirEdicao}
        onDelete={setExcluindo}
      />

      {/* Modal criar/editar */}
      <ProdutoModal
        open={modalOpen}
        produto={editando}
        onClose={fecharModal}
      />

      {/* Dialog de exclusão */}
      <ProdutoDeleteDialog
        produto={excluindo}
        onClose={() => setExcluindo(null)}
      />
    </div>
  );
}
