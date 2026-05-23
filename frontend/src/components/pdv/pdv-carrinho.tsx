"use client";

import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePdvStore } from "@/store/pdv-store";
import { cn } from "@/lib/utils";

export function PdvCarrinho() {
  const itens = usePdvStore((s) => s.itens);
  const incrementar = usePdvStore((s) => s.incrementar);
  const decrementar = usePdvStore((s) => s.decrementar);
  const setQuantidade = usePdvStore((s) => s.setQuantidade);
  const removerItem = usePdvStore((s) => s.removerItem);

  if (itens.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
        <ShoppingCart className="h-12 w-12 opacity-20" />
        <p className="text-sm">Carrinho vazio</p>
        <p className="text-xs">Busque um produto acima para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
            <th className="py-2 text-left font-medium pl-1">Produto</th>
            <th className="py-2 text-center font-medium w-32">Qtd</th>
            <th className="py-2 text-right font-medium w-28">Unit.</th>
            <th className="py-2 text-right font-medium w-28">Subtotal</th>
            <th className="py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {itens.map((item, idx) => {
            const subtotal = item.precoUnitario * item.quantidade;
            return (
              <tr
                key={item.localId}
                className={cn(
                  "border-b transition-colors hover:bg-muted/30",
                  idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                )}
              >
                <td className="py-2.5 pl-1">
                  <p className="font-medium leading-tight">{item.nome}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.sku}
                  </p>
                </td>

                <td className="py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => decrementar(item.localId)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={item.estoqueAtual}
                      value={item.quantidade}
                      onChange={(e) =>
                        setQuantidade(item.localId, Number(e.target.value))
                      }
                      className="h-6 w-14 text-center px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => incrementar(item.localId)}
                      disabled={item.quantidade >= item.estoqueAtual}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                    Estoque: {item.estoqueAtual} {item.unidadeMedida}
                  </p>
                </td>

                <td className="py-2.5 text-right tabular-nums">
                  {item.precoUnitario.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="py-2.5 text-right tabular-nums font-semibold">
                  {subtotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>

                <td className="py-2.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removerItem(item.localId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
