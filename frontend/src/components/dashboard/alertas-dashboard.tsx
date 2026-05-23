"use client";

import { AlertTriangle, CheckCircle2, Package, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDashboardAlertas } from "@/hooks/use-dashboard";
import { brl } from "@/lib/formatters";

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function AlertasDashboard() {
  const { data, isLoading } = useDashboardAlertas();

  const estoque = data?.estoqueBaixo ?? [];
  const contas = data?.contasVencidas ?? [];
  const semAlertas = !isLoading && estoque.length === 0 && contas.length === 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas
        </CardTitle>
        <CardDescription>Estoque baixo e contas vencidas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : semAlertas ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm">Tudo em ordem!</p>
          </div>
        ) : (
          <>
            {estoque.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Estoque Baixo ({estoque.length})
                </p>
                <ul className="space-y-2">
                  {estoque.map((item) => (
                    <li key={item.produtoId} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate font-medium" title={item.nome}>
                        {item.nome}
                      </span>
                      <Badge variant="destructive" className="shrink-0 text-xs tabular-nums">
                        {item.estoqueAtual}/{item.estoqueMinimo}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {estoque.length > 0 && contas.length > 0 && <Separator />}

            {contas.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" />
                  Contas Vencidas ({contas.length})
                </p>
                <ul className="space-y-3">
                  {contas.map((conta) => (
                    <li key={conta.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate flex-1 font-medium" title={conta.descricao}>
                          {conta.descricao}
                        </span>
                        <Badge
                          variant={conta.tipo === "Pagar" ? "destructive" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {conta.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground mt-0.5">
                        <span>Venc. {formatData(conta.vencimento)}</span>
                        <span className="tabular-nums">{brl(conta.valor)}</span>
                      </div>
                      {conta.diasAtraso > 0 && (
                        <p className="text-destructive text-xs mt-0.5">
                          {conta.diasAtraso}{" "}
                          {conta.diasAtraso === 1 ? "dia" : "dias"} em atraso
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
