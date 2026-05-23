"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { useResumoDiaVendas } from "@/hooks/use-vendas-lista";
import { brl } from "@/lib/formatters";

export function VendasResumoDia() {
  const { data, isLoading } = useResumoDiaVendas();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><div className="h-4 w-28 rounded bg-muted animate-pulse" /></CardHeader>
            <CardContent><div className="h-7 w-32 rounded bg-muted animate-pulse" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Vendido Hoje",
      value: brl(data?.totalVendido ?? 0),
      icon: DollarSign,
    },
    {
      title: "Vendas Realizadas",
      value: String(data?.quantidadeVendas ?? 0),
      icon: ShoppingBag,
    },
    {
      title: "Ticket Médio",
      value: brl(data?.ticketMedio ?? 0),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
