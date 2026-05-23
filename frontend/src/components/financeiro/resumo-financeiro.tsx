"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { useResumoFinanceiro } from "@/hooks/use-financeiro";
import { brl } from "@/lib/formatters";

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-36 rounded bg-muted animate-pulse mb-1" />
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function ResumoFinanceiro() {
  const { data, isLoading } = useResumoFinanceiro();

console.log("[RESUMO COMPONENT] isLoading:", isLoading, "data:", data);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const cards = [
    {
      title: "Saldo em Caixa",
      value: brl(data?.saldoCaixa ?? 0),
      description: "posição atual",
      icon: Wallet,
      alert: false,
    },
    {
      title: "A Receber (7 dias)",
      value: brl(data?.totalReceberProximos7Dias ?? 0),
      description: "próximos 7 dias",
      icon: TrendingUp,
      alert: false,
    },
    {
      title: "A Pagar (7 dias)",
      value: brl(data?.totalPagarProximos7Dias ?? 0),
      description: "próximos 7 dias",
      icon: TrendingDown,
      alert: false,
    },
    {
      title: "Vencido a Receber",
      value: brl(data?.totalVencidoReceber ?? 0),
      description: "contas em atraso",
      icon: AlertTriangle,
      alert: (data?.totalVencidoReceber ?? 0) > 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.alert ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.alert ? "text-destructive" : ""}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
