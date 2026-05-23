"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { VendasResumoDia } from "@/components/vendas/vendas-resumo-dia";
import { VendasFiltros } from "@/components/vendas/vendas-filtros";
import { VendasTable } from "@/components/vendas/vendas-table";
import { VendaDetalheModal } from "@/components/vendas/venda-detalhe-modal";
import { CancelarVendaDialog } from "@/components/vendas/cancelar-venda-dialog";
import { useVendasLista } from "@/hooks/use-vendas-lista";
import type { VendaFiltros, VendaLista } from "@/types/venda-lista";

const PAGE_SIZE = 15;

export default function VendasPage() {
  const [filtros, setFiltros] = useState<VendaFiltros>({
    status: "",
    clienteId: "",
    funcionarioId: "",
    dataInicio: "",
    dataFim: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<VendaLista | null>(null);

  const { data, isLoading, isError } = useVendasLista(filtros);

  function handleFiltroChange(parcial: Partial<VendaFiltros> & { page: 1 }) {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
          <p className="text-sm text-muted-foreground">Histórico e gestão de vendas</p>
        </div>
      </div>

      <VendasResumoDia />

      <VendasFiltros filtros={filtros} onChange={handleFiltroChange} />

      {isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
          Erro ao carregar vendas. Verifique sua conexão e tente novamente.
        </div>
      )}

      <VendasTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onVerDetalhe={(v) => setDetalheId(v.id)}
        onCancelar={setCancelando}
      />

      <VendaDetalheModal vendaId={detalheId} onClose={() => setDetalheId(null)} />
      <CancelarVendaDialog venda={cancelando} onClose={() => setCancelando(null)} />
    </div>
  );
}
