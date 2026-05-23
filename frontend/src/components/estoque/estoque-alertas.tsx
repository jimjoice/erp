"use client";

import { AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlertasEstoque } from "@/hooks/use-estoque";

export function EstoqueAlertas() {
  const { data: alertas, isLoading } = useAlertasEstoque();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Alertas de Estoque</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alertas?.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Package className="h-4 w-4 text-green-500" />Alertas de Estoque</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum produto com estoque crítico.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Alertas de Estoque
          <Badge variant="destructive" className="ml-auto">{alertas.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alertas.map((alerta) => (
            <div key={alerta.produtoId} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
              <div>
                <p className="font-medium">{alerta.produtoNome}</p>
                <p className="text-xs text-muted-foreground font-mono">{alerta.sku}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={alerta.situacao === "zerado"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                  }
                >
                  {alerta.situacao === "zerado" ? "Zerado" : "Baixo"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {alerta.estoqueAtual} / {alerta.estoqueMinimo} min
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
