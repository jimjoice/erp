"use client";

import { CreditCard, XCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { usePdvStore } from "@/store/pdv-store";

interface Props {
  onFinalizar: () => void;
  onCancelar: () => void;
}

export function PdvResumo({ onFinalizar, onCancelar }: Props) {
  const itens = usePdvStore((s) => s.itens);
  const descontoPercentual = usePdvStore((s) => s.descontoPercentual);
  const setDesconto = usePdvStore((s) => s.setDesconto);
  const subtotal = usePdvStore((s) => s.subtotal());
  const descontoValor = usePdvStore((s) => s.descontoValor());
  const total = usePdvStore((s) => s.total());

  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0);
  const temItens = itens.length > 0;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Counter */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Itens no carrinho</span>
        <span className="font-semibold text-foreground tabular-nums">
          {totalItens}
        </span>
      </div>

      <Separator />

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular-nums font-medium">{fmt(subtotal)}</span>
      </div>

      {/* Desconto */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-sm text-muted-foreground">
            Desconto (máx. 30%)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={descontoPercentual === 0 ? "" : descontoPercentual}
              placeholder="0"
              onChange={(e) =>
                setDesconto(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-2 text-sm text-muted-foreground">
              %
            </span>
          </div>
          <span className="text-sm tabular-nums text-destructive font-medium w-24 text-right">
            {descontoValor > 0 ? `- ${fmt(descontoValor)}` : "—"}
          </span>
        </div>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold tabular-nums text-primary">
          {fmt(total)}
        </span>
      </div>

      <div className="flex-1" />

      {/* Ações */}
      <div className="space-y-2">
        <Button
          className="w-full h-12 text-base gap-2"
          disabled={!temItens}
          onClick={onFinalizar}
        >
          <CreditCard className="h-5 w-5" />
          Finalizar venda
          <kbd className="ml-auto text-xs opacity-60 font-mono bg-primary-foreground/10 px-1.5 py-0.5 rounded">
            F4
          </kbd>
        </Button>

        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive"
          disabled={!temItens}
          onClick={onCancelar}
        >
          <XCircle className="h-4 w-4" />
          Cancelar venda
          <kbd className="ml-auto text-xs opacity-60 font-mono bg-muted px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </Button>
      </div>
    </div>
  );
}
