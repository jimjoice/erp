"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUltimasVendas } from "@/hooks/use-dashboard";
import { brl } from "@/lib/formatters";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  Finalizada: { label: "Finalizada", variant: "default" },
  Cancelada: { label: "Cancelada", variant: "destructive" },
  EmAndamento: { label: "Em Andamento", variant: "secondary" },
  Aberta: { label: "Aberta", variant: "outline" },
};

const FORMAS: Record<string, string> = {
  Dinheiro: "Dinheiro",
  Debito: "Débito",
  Credito: "Crédito",
  Pix: "PIX",
  Crediario: "Crediário",
};

function formatHorario(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TabelaUltimasVendas() {
  const { data, isLoading } = useUltimasVendas();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Últimas Vendas</CardTitle>
        <CardDescription>5 vendas mais recentes do dia</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : !data?.length ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            Nenhuma venda registrada hoje
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Horário</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((venda) => {
                const status = STATUS_CONFIG[venda.status] ?? {
                  label: venda.status,
                  variant: "secondary" as BadgeVariant,
                };
                const formaPrincipal = venda.pagamentos[0]?.forma ?? "";
                return (
                  <TableRow key={venda.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{String(venda.numero).padStart(5, "0")}
                    </TableCell>
                    <TableCell className="text-sm max-w-[120px] truncate">
                      {venda.clienteNome ?? "Consumidor final"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {FORMAS[formaPrincipal] ?? formaPrincipal}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {brl(venda.total)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
                      {formatHorario(venda.dataVenda)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
