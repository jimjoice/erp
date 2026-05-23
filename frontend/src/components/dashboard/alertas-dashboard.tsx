"use client";

import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardAlertas } from "@/hooks/use-dashboard";

export function AlertasDashboard() {
  const { data, isLoading } = useDashboardAlertas();

  const alertas = data ?? [];
  const semAlertas = !isLoading && alertas.length === 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas
        </CardTitle>
        <CardDescription>Produtos com estoque baixo ou zerado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : semAlertas ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <p className="text-sm">Estoque em ordem!</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Estoque Baixo ({alertas.length})
            </p>
            <ul className="space-y-2">
              {alertas.map((item) => (
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
      </CardContent>
    </Card>
  );
}
