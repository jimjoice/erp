"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContasPagarTable } from "@/components/financeiro/contas-pagar-table";
import { BaixarContaDialog } from "@/components/financeiro/baixar-conta-dialog";
import { ContaPagarModal } from "@/components/financeiro/conta-pagar-modal";
import { CancelarContaDialog } from "@/components/financeiro/cancelar-conta-dialog";
import { useContasPagar, useCancelarContaPagar } from "@/hooks/use-financeiro";
import type { ContaPagar, ContaPagarFiltros } from "@/types/financeiro";

const PAGE_SIZE = 20;

export default function ContasPagarPage() {
  const [filtros, setFiltros] = useState<ContaPagarFiltros>({
    status: "",
    fornecedorId: "",
    dataInicio: "",
    dataFim: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [baixarConta, setBaixarConta] = useState<ContaPagar | null>(null);
  const [modalConta, setModalConta] = useState<ContaPagar | null | "nova">(null);
  const [cancelarConta, setCancelarConta] = useState<ContaPagar | null>(null);

  const { data, isLoading } = useContasPagar(filtros);
  const cancelar = useCancelarContaPagar();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  function setFiltro<K extends keyof ContaPagarFiltros>(key: K, value: ContaPagarFiltros[K]) {
    setFiltros((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  async function confirmarCancelar() {
    if (!cancelarConta) return;
    await cancelar.mutateAsync(cancelarConta.id);
    setCancelarConta(null);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Pagar</h1>
          <p className="text-sm text-muted-foreground">Gerencie as obrigações financeiras da empresa</p>
        </div>
        <Button onClick={() => setModalConta("nova")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filtros.status || "todos"} onValueChange={(v) => setFiltro("status", v === "todos" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Aberta">Aberta</SelectItem>
            <SelectItem value="Vencida">Vencida</SelectItem>
            <SelectItem value="Paga">Paga</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-40"
          value={filtros.dataInicio}
          onChange={(e) => setFiltro("dataInicio", e.target.value)}
          placeholder="De"
        />
        <Input
          type="date"
          className="w-40"
          value={filtros.dataFim}
          onChange={(e) => setFiltro("dataFim", e.target.value)}
          placeholder="Até"
        />

        {(filtros.status || filtros.dataInicio || filtros.dataFim) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFiltros({ status: "", fornecedorId: "", dataInicio: "", dataFim: "", page: 1, pageSize: PAGE_SIZE })}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <ContasPagarTable
        data={items}
        total={total}
        page={filtros.page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        onPageChange={(p) => setFiltros((prev) => ({ ...prev, page: p }))}
        onBaixar={setBaixarConta}
        onEditar={(c) => setModalConta(c)}
        onCancelar={setCancelarConta}
      />

      {/* Dialogs */}
      <BaixarContaDialog
        contaId={baixarConta?.id ?? null}
        tipo="pagar"
        valorOriginal={baixarConta?.valor}
        descricao={baixarConta?.descricao}
        onClose={() => setBaixarConta(null)}
      />

      <ContaPagarModal
        open={modalConta !== null}
        conta={modalConta !== "nova" ? modalConta : null}
        onClose={() => setModalConta(null)}
      />

      <CancelarContaDialog
        open={cancelarConta !== null}
        descricao={cancelarConta?.descricao}
        isPending={cancelar.isPending}
        onConfirmar={confirmarCancelar}
        onClose={() => setCancelarConta(null)}
      />
    </div>
  );
}
