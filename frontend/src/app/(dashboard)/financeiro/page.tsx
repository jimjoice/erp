"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { ResumoFinanceiro } from "@/components/financeiro/resumo-financeiro";
import { FluxoCaixaGrafico } from "@/components/financeiro/fluxo-caixa-grafico";
import { ContasReceberTable } from "@/components/financeiro/contas-receber-table";
import { ContasPagarTable } from "@/components/financeiro/contas-pagar-table";
import { BaixarContaDialog } from "@/components/financeiro/baixar-conta-dialog";
import { useContasReceber, useContasPagar } from "@/hooks/use-financeiro";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ContaReceberFiltros, ContaPagarFiltros, ContaReceber, ContaPagar } from "@/types/financeiro";

const PAGE_SIZE = 15;

function getDefaultDates() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return {
    inicio: inicio.toISOString().split("T")[0],
    fim: fim.toISOString().split("T")[0],
  };
}

const { inicio: defInicio, fim: defFim } = getDefaultDates();

export default function FinanceiroPage() {
  const [abaAtiva, setAbaAtiva] = useState<"visao-geral" | "receber" | "pagar">("visao-geral");

  const [filtrosReceber, setFiltrosReceber] = useState<ContaReceberFiltros>({
    status: "",
    clienteId: "",
    dataInicio: "",
    dataFim: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [filtrosPagar, setFiltrosPagar] = useState<ContaPagarFiltros>({
    status: "",
    fornecedorId: "",
    dataInicio: "",
    dataFim: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [baixandoReceber, setBaixandoReceber] = useState<ContaReceber | null>(null);
  const [baixandoPagar, setBaixandoPagar] = useState<ContaPagar | null>(null);

  const { data: contasReceber, isLoading: loadingReceber } = useContasReceber(filtrosReceber);
  const { data: contasPagar, isLoading: loadingPagar } = useContasPagar(filtrosPagar);

  const abas = [
    { id: "visao-geral" as const, label: "Visão Geral" },
    { id: "receber" as const, label: "Contas a Receber" },
    { id: "pagar" as const, label: "Contas a Pagar" },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Gestão financeira do negócio</p>
        </div>
      </div>

      <ResumoFinanceiro />

      {/* Abas */}
      <div className="flex border-b gap-0">
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === aba.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "visao-geral" && (
        <FluxoCaixaGrafico inicio={defInicio} fim={defFim} />
      )}

      {abaAtiva === "receber" && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={filtrosReceber.status || "__all__"}
              onValueChange={(v) => setFiltrosReceber((p) => ({ ...p, status: v === "__all__" ? "" : v, page: 1 }))}
            >
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[150px]"
              value={filtrosReceber.dataInicio}
              onChange={(e) => setFiltrosReceber((p) => ({ ...p, dataInicio: e.target.value, page: 1 }))}
            />
            <span className="text-muted-foreground text-sm">até</span>
            <Input
              type="date"
              className="w-[150px]"
              value={filtrosReceber.dataFim}
              onChange={(e) => setFiltrosReceber((p) => ({ ...p, dataFim: e.target.value, page: 1 }))}
            />
          </div>

          <ContasReceberTable
            data={contasReceber?.items ?? []}
            total={contasReceber?.total ?? 0}
            page={filtrosReceber.page}
            pageSize={PAGE_SIZE}
            isLoading={loadingReceber}
            onPageChange={(p) => setFiltrosReceber((prev) => ({ ...prev, page: p }))}
            onBaixar={setBaixandoReceber}
          />
        </>
      )}

      {abaAtiva === "pagar" && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={filtrosPagar.status || "__all__"}
              onValueChange={(v) => setFiltrosPagar((p) => ({ ...p, status: v === "__all__" ? "" : v, page: 1 }))}
            >
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-[150px]"
              value={filtrosPagar.dataInicio}
              onChange={(e) => setFiltrosPagar((p) => ({ ...p, dataInicio: e.target.value, page: 1 }))}
            />
            <span className="text-muted-foreground text-sm">até</span>
            <Input
              type="date"
              className="w-[150px]"
              value={filtrosPagar.dataFim}
              onChange={(e) => setFiltrosPagar((p) => ({ ...p, dataFim: e.target.value, page: 1 }))}
            />
          </div>

          <ContasPagarTable
            data={contasPagar?.items ?? []}
            total={contasPagar?.total ?? 0}
            page={filtrosPagar.page}
            pageSize={PAGE_SIZE}
            isLoading={loadingPagar}
            onPageChange={(p) => setFiltrosPagar((prev) => ({ ...prev, page: p }))}
            onBaixar={setBaixandoPagar}
          />
        </>
      )}

      <BaixarContaDialog
        contaId={baixandoReceber?.id ?? null}
        tipo="receber"
        valorOriginal={baixandoReceber?.valor}
        descricao={baixandoReceber?.descricao}
        onClose={() => setBaixandoReceber(null)}
      />

      <BaixarContaDialog
        contaId={baixandoPagar?.id ?? null}
        tipo="pagar"
        valorOriginal={baixandoPagar?.valor}
        descricao={baixandoPagar?.descricao}
        onClose={() => setBaixandoPagar(null)}
      />
    </div>
  );
}
