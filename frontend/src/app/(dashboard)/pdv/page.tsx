"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  Monitor,
  Keyboard,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PdvBusca, type PdvBuscaRef } from "@/components/pdv/pdv-busca";
import { PdvCarrinho } from "@/components/pdv/pdv-carrinho";
import { PdvResumo } from "@/components/pdv/pdv-resumo";
import { PdvModalPagamento } from "@/components/pdv/pdv-modal-pagamento";
import { PdvModalCancelar } from "@/components/pdv/pdv-modal-cancelar";
import { usePdvStore } from "@/store/pdv-store";
import { useAuthStore } from "@/store/auth-store";
import { vendaService } from "@/services/venda-service";
import type { PagamentoRascunho, VendaConfirmada } from "@/types/venda";

export default function PdvPage() {
  const buscaRef = useRef<PdvBuscaRef>(null);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [vendaConfirmada, setVendaConfirmada] = useState<VendaConfirmada | null>(null);

  const user = useAuthStore((s) => s.user);
  const itens = usePdvStore((s) => s.itens);
  const total = usePdvStore((s) => s.total());
  const descontoPercentual = usePdvStore((s) => s.descontoPercentual);
  const limpar = usePdvStore((s) => s.limpar);

  const temItens = itens.length > 0;
  const algumModalAberto = modalPagamento || modalCancelar || !!vendaConfirmada;

  // ── Finalizar mutation ─────────────────────────────────────────────────────
  const finalizarMutation = useMutation({
    mutationFn: async (pagamentos: PagamentoRascunho[]) => {
      const funcionarioId = user?.id ?? "";
      const venda = await vendaService.criar(
        funcionarioId,
        itens,
        descontoPercentual
      );
      const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
      await vendaService.finalizar(venda.id, pagamentos);
      return {
        id: venda.id,
        numero: venda.numero,
        total: venda.total,
        troco: Math.max(0, totalPago - venda.total),
      } satisfies VendaConfirmada;
    },
    onSuccess: (data) => {
      setModalPagamento(false);
      setVendaConfirmada(data);
      limpar();
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const abrirPagamento = useCallback(() => {
    if (temItens && !algumModalAberto) setModalPagamento(true);
  }, [temItens, algumModalAberto]);

  const abrirCancelar = useCallback(() => {
    if (temItens && !algumModalAberto) setModalCancelar(true);
  }, [temItens, algumModalAberto]);

  function confirmarCancelar() {
    limpar();
    setModalCancelar(false);
  }

  function confirmarPagamento(pagamentos: PagamentoRascunho[]) {
    finalizarMutation.mutate(pagamentos);
  }

  function novaVenda() {
    setVendaConfirmada(null);
    setTimeout(() => buscaRef.current?.focus(), 100);
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        if (!algumModalAberto) buscaRef.current?.focus();
      }
      if (e.key === "F4") {
        e.preventDefault();
        abrirPagamento();
      }
      if (e.key === "Escape") {
        if (!modalPagamento && !modalCancelar && !vendaConfirmada) {
          abrirCancelar();
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [abrirPagamento, abrirCancelar, algumModalAberto, modalPagamento, modalCancelar, vendaConfirmada]);

  // ── Success overlay ───────────────────────────────────────────────────────
  if (vendaConfirmada) {
    const fmt = (v: number) =>
      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
            Venda #{vendaConfirmada.numero} finalizada!
          </h2>
          <p className="text-muted-foreground text-lg">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {fmt(vendaConfirmada.total)}
            </span>
          </p>
          {vendaConfirmada.troco > 0 && (
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-8 py-4">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                Troco: {fmt(vendaConfirmada.troco)}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={novaVenda}
          className="mt-4 rounded-xl bg-primary text-primary-foreground px-10 py-3 text-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Nova venda
        </button>
      </div>
    );
  }

  // ── Main PDV layout ───────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — search + cart */}
      <div className="flex flex-1 flex-col overflow-hidden border-r">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Monitor className="h-5 w-5 text-muted-foreground" />
          <h1 className="font-semibold">PDV — Ponto de Venda</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5" />
            <span>F2 buscar · F4 finalizar · ESC cancelar</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <PdvBusca ref={buscaRef} />
        </div>

        {/* Error */}
        {finalizarMutation.isError && (
          <div className="mx-4 mt-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
            {(finalizarMutation.error as Error)?.message ??
              "Erro ao finalizar venda. Tente novamente."}
          </div>
        )}

        {/* Cart */}
        <div className="flex flex-1 flex-col overflow-hidden px-4 py-2">
          <PdvCarrinho />
        </div>
      </div>

      {/* Right — summary */}
      <div className="w-72 shrink-0 flex flex-col bg-muted/20">
        <PdvResumo
          onFinalizar={abrirPagamento}
          onCancelar={abrirCancelar}
        />
      </div>

      {/* Modals */}
      <PdvModalPagamento
        open={modalPagamento}
        total={total}
        isPending={finalizarMutation.isPending}
        onConfirmar={confirmarPagamento}
        onClose={() => setModalPagamento(false)}
      />

      <PdvModalCancelar
        open={modalCancelar}
        onConfirmar={confirmarCancelar}
        onClose={() => setModalCancelar(false)}
      />
    </div>
  );
}
