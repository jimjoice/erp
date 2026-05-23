"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { EstoqueTable } from "@/components/estoque/estoque-table";
import { EstoqueAlertas } from "@/components/estoque/estoque-alertas";
import { EstoqueModalEntrada } from "@/components/estoque/estoque-modal-entrada";
import { EstoqueModalSaida } from "@/components/estoque/estoque-modal-saida";
import { MovimentacoesTable } from "@/components/estoque/movimentacoes-table";
import { usePosicaoEstoque, useMovimentacoesEstoque } from "@/hooks/use-estoque";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { PosicaoEstoque, EstoqueFiltros, MovimentacaoFiltros } from "@/types/estoque";

const PAGE_SIZE = 15;

type AcaoEstoque = "entrada" | "saida" | "inventario" | null;

export default function EstoquePage() {
  const [abaAtiva, setAbaAtiva] = useState<"posicao" | "movimentacoes">("posicao");

  const [filtrosPosicao, setFiltrosPosicao] = useState<EstoqueFiltros>({
    search: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [filtrosMov, setFiltrosMov] = useState<MovimentacaoFiltros>({
    produtoId: "",
    tipo: "",
    dataInicio: "",
    dataFim: "",
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [itemSelecionado, setItemSelecionado] = useState<PosicaoEstoque | null>(null);
  const [acao, setAcao] = useState<AcaoEstoque>(null);
  const [busca, setBusca] = useState("");

  const { data: posicao, isLoading: loadingPosicao, isError: errorPosicao } = usePosicaoEstoque(filtrosPosicao);
  const { data: movimentacoes, isLoading: loadingMov } = useMovimentacoesEstoque(filtrosMov);

  function handleEntrada(item: PosicaoEstoque) {
    setItemSelecionado(item);
    setAcao("entrada");
  }

  function handleSaida(item: PosicaoEstoque) {
    setItemSelecionado(item);
    setAcao("saida");
  }

  function handleInventario(item: PosicaoEstoque) {
    setItemSelecionado(item);
    setAcao("inventario");
  }

  function fecharModal() {
    setItemSelecionado(null);
    setAcao(null);
  }

  const abas = [
    { id: "posicao" as const, label: "Posição atual" },
    { id: "movimentacoes" as const, label: "Movimentações" },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-muted-foreground">Controle e movimentação de estoque</p>
        </div>
      </div>

      <EstoqueAlertas />

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

      {abaAtiva === "posicao" && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="pl-8"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setFiltrosPosicao((prev) => ({ ...prev, search: e.target.value, page: 1 }));
              }}
            />
          </div>

          {errorPosicao && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
              Erro ao carregar estoque.
            </div>
          )}

          <EstoqueTable
            data={posicao?.items ?? []}
            total={posicao?.total ?? 0}
            page={filtrosPosicao.page}
            pageSize={PAGE_SIZE}
            isLoading={loadingPosicao}
            onPageChange={(p) => setFiltrosPosicao((prev) => ({ ...prev, page: p }))}
            onEntrada={handleEntrada}
            onSaida={handleSaida}
            onInventario={handleInventario}
          />
        </>
      )}

      {abaAtiva === "movimentacoes" && (
        <MovimentacoesTable
          data={movimentacoes?.items ?? []}
          total={movimentacoes?.total ?? 0}
          page={filtrosMov.page}
          pageSize={PAGE_SIZE}
          isLoading={loadingMov}
          onPageChange={(p) => setFiltrosMov((prev) => ({ ...prev, page: p }))}
        />
      )}

      <EstoqueModalEntrada
        item={acao === "entrada" ? itemSelecionado : null}
        onClose={fecharModal}
      />

      <EstoqueModalSaida
        item={acao === "saida" || acao === "inventario" ? itemSelecionado : null}
        modo={acao === "inventario" ? "inventario" : "saida"}
        onClose={fecharModal}
      />
    </div>
  );
}
