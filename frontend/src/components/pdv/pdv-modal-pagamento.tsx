"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORMAS_PAGAMENTO,
  type FormaPagamento,
  type PagamentoRascunho,
} from "@/types/venda";

interface Props {
  open: boolean;
  total: number;
  isPending: boolean;
  onConfirmar: (pagamentos: PagamentoRascunho[]) => void;
  onClose: () => void;
}

const PARCELAVEL: FormaPagamento[] = ["Credito", "Crediario"];

function novoPagamento(valor: number): PagamentoRascunho {
  return {
    localId: crypto.randomUUID(),
    forma: "Dinheiro",
    valor,
    parcelas: 1,
  };
}

export function PdvModalPagamento({
  open,
  total,
  isPending,
  onConfirmar,
  onClose,
}: Props) {
  const [pagamentos, setPagamentos] = useState<PagamentoRascunho[]>([]);

  useEffect(() => {
    if (open) setPagamentos([novoPagamento(total)]);
  }, [open, total]);

  const totalPago = pagamentos.reduce((s, p) => s + (p.valor || 0), 0);
  const troco = Math.max(0, totalPago - total);
  const falta = Math.max(0, total - totalPago);
  const podeFinalizar = totalPago >= total && pagamentos.length > 0 && !isPending;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function add() {
    setPagamentos((prev) => [...prev, novoPagamento(Math.max(0, falta))]);
  }

  function remove(id: string) {
    setPagamentos((prev) => prev.filter((p) => p.localId !== id));
  }

  function update(id: string, patch: Partial<PagamentoRascunho>) {
    setPagamentos((prev) =>
      prev.map((p) => (p.localId === id ? { ...p, ...patch } : p))
    );
  }

  function handleFormaChange(id: string, forma: FormaPagamento) {
    update(id, {
      forma,
      parcelas: PARCELAVEL.includes(forma) ? 1 : 1,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento</DialogTitle>
        </DialogHeader>

        {/* Total */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-muted-foreground text-sm">Total a pagar</span>
          <span className="text-2xl font-bold tabular-nums text-primary">
            {fmt(total)}
          </span>
        </div>

        {/* Pagamentos */}
        <div className="space-y-3">
          {pagamentos.map((p, idx) => (
            <div key={p.localId} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Pagamento {idx + 1}
                </Label>
                {pagamentos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => remove(p.localId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Select
                  value={p.forma}
                  onValueChange={(v) =>
                    handleFormaChange(p.localId, v as FormaPagamento)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative w-36">
                  <span className="absolute left-3 top-2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={p.valor || ""}
                    placeholder="0,00"
                    onChange={(e) =>
                      update(p.localId, { valor: Number(e.target.value) })
                    }
                    className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Parcelas — só para Crédito / Crediário */}
              {PARCELAVEL.includes(p.forma) && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs w-20 shrink-0">Parcelas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={p.parcelas}
                    onChange={(e) =>
                      update(p.localId, {
                        parcelas: Math.min(12, Math.max(1, Number(e.target.value))),
                      })
                    }
                    className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-muted-foreground">
                    {p.parcelas > 1
                      ? `${fmt(p.valor / p.parcelas)}/parcela`
                      : "à vista"}
                  </span>
                </div>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={add}
            disabled={pagamentos.length >= 3}
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar forma de pagamento
          </Button>
        </div>

        <Separator />

        {/* Resumo */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total pago</span>
            <span className="tabular-nums font-medium">{fmt(totalPago)}</span>
          </div>

          {falta > 0 && (
            <div className="flex justify-between text-destructive font-medium">
              <span>Falta</span>
              <span className="tabular-nums">{fmt(falta)}</span>
            </div>
          )}

          {troco > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold text-base">
              <span>Troco</span>
              <span className="tabular-nums">{fmt(troco)}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Voltar
          </Button>
          <Button
            className="gap-2"
            disabled={!podeFinalizar}
            onClick={() => onConfirmar(pagamentos)}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? "Processando…" : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
