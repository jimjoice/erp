"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useVendaDetalhe } from "@/hooks/use-vendas-lista";
import { brl } from "@/lib/formatters";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Orcamento: { label: "Orçamento", className: "bg-amber-100 text-amber-800 border-amber-200" },
  Finalizada: { label: "Finalizada", className: "bg-green-100 text-green-800 border-green-200" },
  Cancelada: { label: "Cancelada", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const FORMA_LABEL: Record<number, string> = {
  1: "Dinheiro", 2: "Débito", 3: "Crédito", 4: "PIX", 5: "Crediário",
};

interface Props {
  vendaId: string | null;
  onClose: () => void;
}

export function VendaDetalheModal({ vendaId, onClose }: Props) {
  const { data: venda, isLoading } = useVendaDetalhe(vendaId);

  const statusInfo = venda ? STATUS_BADGE[venda.status] : null;

  return (
    <Dialog open={!!vendaId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {venda ? `Venda #${venda.numero}` : "Detalhes da Venda"}
            {statusInfo && (
              <Badge variant="outline" className={statusInfo.className}>{statusInfo.label}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !venda ? (
          <p className="text-muted-foreground text-sm text-center py-8">Venda não encontrada.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{new Date(venda.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendedor</p>
                <p className="font-medium">{venda.funcionarioNome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cliente</p>
                <p className="font-medium">{venda.clienteNome ?? "Consumidor final"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Itens</p>
              <div className="rounded-md border divide-y">
                {venda.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <p className="font-medium">{item.produtoNome}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums">{item.quantidade} × {brl(item.precoUnitario)}</p>
                      {item.desconto > 0 && (
                        <p className="text-xs text-muted-foreground">Desc: {brl(item.desconto)}</p>
                      )}
                      <p className="font-medium">{brl(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{brl(venda.subtotal)}</span>
              </div>
              {venda.desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto</span>
                  <span className="tabular-nums">-{brl(venda.desconto)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="tabular-nums">{brl(venda.total)}</span>
              </div>
            </div>

            {venda.pagamentos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Pagamentos</p>
                <div className="space-y-2">
                  {venda.pagamentos.map((pg) => (
                    <div key={pg.id} className="flex items-center justify-between text-sm rounded-md border p-2.5">
                      <span>{typeof pg.forma === "number" ? (FORMA_LABEL[pg.forma] ?? `Forma ${pg.forma}`) : pg.forma}{pg.parcelas > 1 ? ` (${pg.parcelas}x)` : ""}</span>
                      <span className="tabular-nums font-medium">{brl(pg.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
